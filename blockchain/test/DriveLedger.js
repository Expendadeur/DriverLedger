import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("DriveLedger Platform", function () {
    let AccessControl, Marketplace, Booking;
    let accessControl, marketplace, booking;
    let owner, admin, employee, client;

    beforeEach(async function () {
        [owner, admin, employee, client] = await ethers.getSigners();

        AccessControl = await ethers.getContractFactory("DriveLedgerAccessControl");
        accessControl = await AccessControl.deploy();

        Marketplace = await ethers.getContractFactory("DriveLedgerMarketplace");
        marketplace = await Marketplace.deploy(await accessControl.getAddress());

        Booking = await ethers.getContractFactory("DriveLedgerBooking");
        booking = await Booking.deploy(await accessControl.getAddress());

        // Setup roles
        await accessControl.grantRole(await accessControl.ADMIN_ROLE(), admin.address);
        await accessControl.grantRole(await accessControl.EMPLOYEE_ROLE(), employee.address);
        await accessControl.connect(client).registerAsClient();
    });

    describe("Marketplace", function () {
        it("Should allow admin to add products", async function () {
            await marketplace.connect(admin).addProduct("Car Cover", "Premium protection", ethers.parseEther("0.1"), 10);
            const product = await marketplace.products(1);
            expect(product.name).to.equal("Car Cover");
            expect(product.stock).to.equal(10n);
        });

        it("Should allow client to purchase products", async function () {
            await marketplace.connect(admin).addProduct("Car Cover", "Premium protection", ethers.parseEther("0.1"), 10);
            await marketplace.connect(client).purchaseProduct(1, { value: ethers.parseEther("0.1") });
            const product = await marketplace.products(1);
            expect(product.stock).to.equal(9n);
        });
    });

    describe("Booking", function () {
        it("Should allow admin to add vehicles", async function () {
            await booking.connect(admin).addVehicle("Tesla Model 3", "ABC-123", ethers.parseEther("0.5"));
            const vehicle = await booking.vehicles(1);
            expect(vehicle.model).to.equal("Tesla Model 3");
        });

        it("Should allow client to book vehicles", async function () {
            await booking.connect(admin).addVehicle("Tesla Model 3", "ABC-123", ethers.parseEther("0.5"));
            await booking.connect(client).bookVehicle(1, 2, { value: ethers.parseEther("1.0") });
            const reservation = await booking.reservations(1);
            expect(reservation.client).to.equal(client.address);
            expect(reservation.status).to.equal("CONFIRMED");
        });
    });
});
