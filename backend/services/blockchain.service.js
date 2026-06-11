const { ethers } = require('ethers');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const AccessControlABI = [
    "function isAdmin(address account) view returns (bool)",
    "function isEmployee(address account) view returns (bool)",
    "function isDeactivated(address account) view returns (bool)"
];

const MarketplaceABI = [
    "function products(uint256) view returns (uint256 id, string name, string description, uint256 price, uint256 stock, address seller, bool isActive)",
    "event ProductAdded(uint256 indexed id, string name, uint256 price, uint256 stock)",
    "event ProductUpdated(uint256 indexed id, string name, uint256 price, uint256 stock)",
    "event ProductPurchased(uint256 indexed orderId, uint256 indexed productId, address indexed buyer, uint256 amount)",
    "event OrderStatusUpdated(uint256 indexed orderId, string status)"
];

const BookingABI = [
    "function vehicles(uint256) view returns (uint256 id, string model, string plateNumber, uint256 dailyPrice, bool isAvailable)",
    "event VehicleAdded(uint256 indexed id, string model, uint256 dailyPrice)",
    "event VehicleUpdated(uint256 indexed id, string model, uint256 dailyPrice, bool isAvailable)",
    "event ReservationCreated(uint256 indexed id, uint256 indexed vehicleId, address indexed client, uint256 totalPaid)",
    "event ReservationStatusUpdated(uint256 indexed id, string status)"
];

let io;
const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_NODE_URL || "http://127.0.0.1:8545");

const accessControlContract = new ethers.Contract(process.env.ACCESS_CONTROL_ADDRESS, AccessControlABI, provider);
const marketplaceContract = new ethers.Contract(process.env.MARKETPLACE_ADDRESS, MarketplaceABI, provider);
const bookingContract = new ethers.Contract(process.env.BOOKING_ADDRESS, BookingABI, provider);

const setIo = (_io) => { io = _io; };

const startIndexer = async () => {
    console.log("Starting Blockchain Indexer (Polling Mode)...");

    let lastBlock = await provider.getBlockNumber();

    // Polling interval for local dev
    setInterval(async () => {
        try {
            const currentBlock = await provider.getBlockNumber();
            if (currentBlock <= lastBlock) return;

            console.log(`Scanning blocks ${lastBlock + 1} to ${currentBlock}`);

            // ProductAdded
            const productAddedLogs = await marketplaceContract.queryFilter("ProductAdded", lastBlock + 1, currentBlock);
            for (const log of productAddedLogs) {
                const { id, name, price, stock } = log.args;
                console.log(`Indexer: ProductAdded ${id}`);
                const product = await prisma.product.upsert({
                    where: { id: Number(id) },
                    update: { name, price: price.toString(), stock: Number(stock) },
                    create: { id: Number(id), name, description: "", price: price.toString(), stock: Number(stock) }
                });
                if (io) io.emit('PRODUCT_ADDED', product);
            }

            // ProductPurchased
            const productPurchasedLogs = await marketplaceContract.queryFilter("ProductPurchased", lastBlock + 1, currentBlock);
            for (const log of productPurchasedLogs) {
                const { orderId, productId, buyer, amount } = log.args;
                console.log(`Indexer: ProductPurchased ${orderId}`);
                const order = await prisma.order.create({
                    data: {
                        id: Number(orderId),
                        productId: Number(productId),
                        buyer: buyer.toLowerCase(),
                        amount: amount.toString(),
                        status: "PAID",
                        txHash: log.transactionHash
                    },
                    include: { product: true }
                });
                await prisma.product.update({
                    where: { id: Number(productId) },
                    data: { stock: { decrement: 1 } }
                });
                if (io) io.emit('ORDER_CONFIRMED', order);
            }

            // VehicleAdded
            const vehicleAddedLogs = await bookingContract.queryFilter("VehicleAdded", lastBlock + 1, currentBlock);
            for (const log of vehicleAddedLogs) {
                const { id, model, dailyPrice } = log.args;
                const vehicleData = await bookingContract.vehicles(id);
                const vehicle = await prisma.vehicle.upsert({
                    where: { id: Number(id) },
                    update: { model, dailyPrice: dailyPrice.toString(), available: vehicleData.isAvailable },
                    create: {
                        id: Number(id),
                        model,
                        plateNumber: vehicleData.plateNumber,
                        dailyPrice: dailyPrice.toString(),
                        available: vehicleData.isAvailable
                    }
                });
                if (io) io.emit('VEHICLE_ADDED', vehicle);
            }

            // ReservationCreated
            const reservationCreatedLogs = await bookingContract.queryFilter("ReservationCreated", lastBlock + 1, currentBlock);
            for (const log of reservationCreatedLogs) {
                const { id, vehicleId, client, totalPaid } = log.args;
                const reservation = await prisma.reservation.create({
                    data: {
                        id: Number(id),
                        vehicleId: Number(vehicleId),
                        client: client.toLowerCase(),
                        amount: totalPaid.toString(),
                        status: "CONFIRMED",
                        startTime: new Date(),
                        endTime: new Date(Date.now() + 86400000), // Default 1 day
                        txHash: log.transactionHash
                    },
                    include: { vehicle: true }
                });
                if (io) io.emit('RESERVATION_CONFIRMED', reservation);
            }

            lastBlock = currentBlock;
        } catch (err) {
            console.error("Indexer Error:", err.message);
        }
    }, 5000); // Poll every 5 seconds
};

module.exports = { startIndexer, setIo, accessControlContract };
