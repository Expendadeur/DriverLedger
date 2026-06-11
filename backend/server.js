require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const { startIndexer, setIo, accessControlContract } = require('./services/blockchain.service');
const { generateNonce, verifySignature, signToken } = require('./services/auth.service');
const jwt = require('jsonwebtoken');
const { generateQRCode, generateInvoicePDF } = require('./services/file.service');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

setIo(io);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (/image\/(jpg|jpeg|png|gif|webp)/.test(file.mimetype)) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    }
});

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 });
app.use('/api', limiter);

// ─────────────────── AUTH MIDDLEWARE ───────────────────
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const isAdmin = async (req, res, next) => {
    try {
        const ok = await accessControlContract.isAdmin(req.user.address);
        if (!ok) return res.status(403).json({ error: "Admin only (on-chain check)" });
        next();
    } catch (err) {
        if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Admin only" });
        next();
    }
};

const isEmployee = async (req, res, next) => {
    try {
        const [admin, emp] = await Promise.all([
            accessControlContract.isAdmin(req.user.address),
            accessControlContract.isEmployee(req.user.address)
        ]);
        if (!admin && !emp) return res.status(403).json({ error: "Employee only (on-chain check)" });
        next();
    } catch (err) {
        if (req.user.role !== 'EMPLOYEE' && req.user.role !== 'ADMIN') return res.status(403).json({ error: "Employee only" });
        next();
    }
};

// ────────────────────── AUTH ROUTES ──────────────────────
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    const address = req.user.address;
    try {
        const [isAdminVal, isEmployeeVal, isDeactivatedVal] = await Promise.all([
            accessControlContract.isAdmin(address),
            accessControlContract.isEmployee(address),
            accessControlContract.isDeactivated(address)
        ]);
        let role = "CLIENT";
        if (isAdminVal) role = "ADMIN";
        else if (isEmployeeVal) role = "EMPLOYEE";
        const user = await prisma.user.upsert({
            where: { address: address.toLowerCase() },
            update: { role, isDeactivated: isDeactivatedVal },
            create: { address: address.toLowerCase(), role, isDeactivated: isDeactivatedVal }
        });
        res.json(user);
    } catch (err) {
        const user = await prisma.user.findUnique({ where: { address: address.toLowerCase() } });
        res.json(user);
    }
});

app.post('/api/auth/nonce', (req, res) => {
    res.json({ nonce: generateNonce() });
});

app.post('/api/auth/login', async (req, res) => {
    const { address, signature, nonce } = req.body;
    if (!verifySignature(address, signature, nonce)) {
        return res.status(401).json({ error: "Invalid signature" });
    }
    let role = "CLIENT";
    try {
        const [isAdminVal, isEmployeeVal, isDeactivatedVal] = await Promise.all([
            accessControlContract.isAdmin(address),
            accessControlContract.isEmployee(address),
            accessControlContract.isDeactivated(address)
        ]);
        if (isAdminVal) role = "ADMIN";
        else if (isEmployeeVal) role = "EMPLOYEE";
        const user = await prisma.user.upsert({
            where: { address: address.toLowerCase() },
            update: { role, isDeactivated: isDeactivatedVal },
            create: { address: address.toLowerCase(), role, isDeactivated: isDeactivatedVal }
        });
        const token = signToken(user);
        res.json({ token, user });
    } catch (err) {
        console.error("On-chain sync failed:", err.message);
        let user = await prisma.user.findUnique({ where: { address: address.toLowerCase() } });
        if (!user) user = await prisma.user.create({ data: { address: address.toLowerCase(), role: "CLIENT" } });
        const token = signToken(user);
        res.json({ token, user });
    }
});

// ────────────────────── IMAGE UPLOAD ──────────────────────
app.post('/api/upload/image', authenticateToken, upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    try {
        // Lire le fichier local en Base64
        const fileData = fs.readFileSync(req.file.path, { encoding: 'base64' });
        
        // Préparer les données pour ImgBB
        const params = new URLSearchParams();
        params.append('key', 'c0bc066765c397ce2205a198120f05f5');
        params.append('image', fileData);

        // Envoyer à ImgBB
        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: params
        });
        
        const json = await response.json();
        
        // Supprimer le fichier temporaire local
        fs.unlinkSync(req.file.path);

        if (json.success) {
            res.json({ url: json.data.url });
        } else {
            res.status(500).json({ error: "ImgBB upload failed: " + JSON.stringify(json) });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ────────────────────── PRODUCT ROUTES ──────────────────────
app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({ where: { active: true }, orderBy: { updatedAt: 'desc' } });
        res.json(products);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/products/all', authenticateToken, isAdmin, async (req, res) => {
    try {
        const products = await prisma.product.findMany({ orderBy: { updatedAt: 'desc' } });
        res.json(products);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.json(product);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Sync product from blockchain event (called by indexer or admin)
app.post('/api/products/sync', authenticateToken, isAdmin, async (req, res) => {
    const { id, name, description, price, stock, seller, active, imageUrl } = req.body;
    try {
        const product = await prisma.product.upsert({
            where: { id: parseInt(id) },
            update: { name, description, price: price.toString(), stock: parseInt(stock), active, imageUrl, seller: seller?.toLowerCase() },
            create: { id: parseInt(id), name, description, price: price.toString(), stock: parseInt(stock), active: true, imageUrl: imageUrl || '', seller: seller?.toLowerCase() || '' }
        });
        res.json(product);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ────────────────────── VEHICLE ROUTES ──────────────────────
app.get('/api/vehicles', async (req, res) => {
    try {
        const vehicles = await prisma.vehicle.findMany({ where: { available: true }, orderBy: { updatedAt: 'desc' } });
        res.json(vehicles);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/vehicles/all', authenticateToken, isAdmin, async (req, res) => {
    try {
        const vehicles = await prisma.vehicle.findMany({ orderBy: { updatedAt: 'desc' } });
        res.json(vehicles);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/vehicles/sync', authenticateToken, isAdmin, async (req, res) => {
    const { id, model, plateNumber, dailyPrice, available, vehicleType, imageUrl } = req.body;
    try {
        const vehicle = await prisma.vehicle.upsert({
            where: { id: parseInt(id) },
            update: { model, plateNumber, dailyPrice: dailyPrice.toString(), available, vehicleType: vehicleType || 'car', imageUrl },
            create: { id: parseInt(id), model, plateNumber, dailyPrice: dailyPrice.toString(), available: true, vehicleType: vehicleType || 'car', imageUrl: imageUrl || '' }
        });
        res.json(vehicle);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ────────────────────── USER MANAGEMENT (ADMIN) ──────────────────────
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/admin/user/:address/deactivate', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { deactivated } = req.body;
        const user = await prisma.user.update({
            where: { address: req.params.address.toLowerCase() },
            data: { isDeactivated: !!deactivated }
        });
        res.json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/admin/user/:address/role', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await prisma.user.update({
            where: { address: req.params.address.toLowerCase() },
            data: { role }
        });
        res.json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ────────────────────── ORDER ROUTES ──────────────────────
app.get('/api/admin/orders', authenticateToken, isAdmin, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({ include: { product: true, user: true }, orderBy: { timestamp: 'desc' } });
        res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/user/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { buyer: req.user.address.toLowerCase() },
            include: { product: true },
            orderBy: { timestamp: 'desc' }
        });
        res.json(orders);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/employee/order/:id/status', authenticateToken, isEmployee, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await prisma.order.update({
            where: { id: parseInt(req.params.id) },
            data: { status }
        });
        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ────────────────────── RESERVATION ROUTES ──────────────────────
app.get('/api/admin/reservations', authenticateToken, isAdmin, async (req, res) => {
    try {
        const reservations = await prisma.reservation.findMany({ include: { vehicle: true, user: true }, orderBy: { startTime: 'desc' } });
        res.json(reservations);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/user/reservations', authenticateToken, async (req, res) => {
    try {
        const reservations = await prisma.reservation.findMany({
            where: { client: req.user.address.toLowerCase() },
            include: { vehicle: true },
            orderBy: { startTime: 'desc' }
        });
        res.json(reservations);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/employee/reservations-today', authenticateToken, isEmployee, async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        const reservations = await prisma.reservation.findMany({
            where: { startTime: { gte: start, lt: end } },
            include: { vehicle: true }
        });
        res.json(reservations);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ────────────────────── STATS ROUTE ──────────────────────
app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [ordersCount, reservationsCount, productsCount, usersCount, orders] = await Promise.all([
            prisma.order.count(),
            prisma.reservation.count(),
            prisma.product.count(),
            prisma.user.count(),
            prisma.order.findMany({ select: { amount: true } })
        ]);
        const totalSales = orders.reduce((acc, o) => acc + BigInt(o.amount), BigInt(0));
        res.json({
            sales: Number(totalSales) / 1e18,
            bookings: reservationsCount,
            products: productsCount,
            clients: usersCount,
            orders: ordersCount
        });
    } catch (err) {
        console.error("Stats error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ────────────────────── SCAN / QR / PDF ROUTES ──────────────────────
app.post('/api/scan/validate', authenticateToken, isEmployee, async (req, res) => {
    const { data } = req.body;
    const order = await prisma.order.findUnique({ where: { txHash: data }, include: { product: true } });
    const reservation = await prisma.reservation.findUnique({ where: { txHash: data }, include: { vehicle: true } });
    if (order) return res.json({ valid: true, type: 'ORDER', data: order });
    if (reservation) return res.json({ valid: true, type: 'RES', data: reservation });
    res.status(404).json({ valid: false, message: "Invalid or expired QR" });
});

app.get('/api/files/qr', async (req, res) => {
    const { data } = req.query;
    try {
        const qr = await generateQRCode(data);
        res.json({ qr });
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/files/invoice/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const order = await prisma.order.findUnique({ where: { id: parseInt(id) }, include: { product: true } });
        if (!order) return res.status(404).send("Order not found");
        const outputPath = path.join(__dirname, 'temp', `invoice_${id}.pdf`);
        if (!fs.existsSync(path.join(__dirname, 'temp'))) fs.mkdirSync(path.join(__dirname, 'temp'));
        await generateInvoicePDF(order, outputPath);
        res.download(outputPath, (err) => { if (!err) fs.unlinkSync(outputPath); });
    } catch (err) { res.status(500).send(err.message); }
});

// ────────────────────── SERVER START ──────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startIndexer();
});
