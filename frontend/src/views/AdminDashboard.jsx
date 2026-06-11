import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, ShoppingCart, Car, Users, Package,
    Plus, Edit, Trash2, ToggleLeft, ToggleRight, Upload,
    Eye, EyeOff, RefreshCw, X, Check, AlertCircle, Loader2,
    TrendingUp, DollarSign, BarChart3, UserCheck
} from 'lucide-react';
import api from '../services/api';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_ADDRESSES, MARKETPLACE_ABI, BOOKING_ABI, ACCESS_CONTROL_ABI } from '../services/contracts';

console.log("Using Contract Addresses:", CONTRACT_ADDRESSES);

// ───── Modal Component ─────
const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="modal-overlay" onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="modal-container" onClick={e => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <h3>{title}</h3>
                        <button onClick={onClose} className="btn-icon"><X size={20} /></button>
                    </div>
                    <div className="modal-body">{children}</div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ───── Image Uploader ─────
const ImageUploader = ({ currentUrl, onUpload, token }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentUrl || '');

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const form = new FormData();
        form.append('image', file);
        try {
            const res = await api.post('/api/upload/image', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPreview(res.data.url);
            onUpload(res.data.url);
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="image-uploader">
            {preview && <img src={preview} alt="Preview" className="image-preview" />}
            <label className="upload-btn">
                {uploading ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
                {uploading ? ' Envoi...' : ' Choisir image'}
                <input type="file" accept="image/*" onChange={handleFile} hidden />
            </label>
        </div>
    );
};

// ───── STATS TAB ─────
const StatsTab = ({ stats }) => (
    <div className="stats-grid">
        {[
            { icon: ShoppingCart, label: 'Commandes', value: stats.orders || 0, color: '#6366f1' },
            { icon: Car, label: 'Réservations', value: stats.bookings || 0, color: '#8b5cf6' },
            { icon: Package, label: 'Produits', value: stats.products || 0, color: '#06b6d4' },
            { icon: Users, label: 'Utilisateurs', value: stats.clients || 0, color: '#10b981' },
            { icon: DollarSign, label: 'Revenu (ETH)', value: (stats.sales || 0).toFixed(4), color: '#f59e0b' },
        ].map(({ icon: Icon, label, value, color }) => (
            <motion.div key={label} className="stat-card" whileHover={{ scale: 1.03 }}>
                <div className="stat-icon" style={{ background: `${color}20`, color }}>
                    <Icon size={24} />
                </div>
                <div>
                    <p className="stat-label">{label}</p>
                    <p className="stat-value">{value}</p>
                </div>
            </motion.div>
        ))}
    </div>
);

// ───── PRODUCTS TAB ─────
const ProductsTab = ({ token, signer }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', imageUrl: '' });
    const [txStatus, setTxStatus] = useState('');

    const fetchProducts = async () => {
        const res = await api.get('/api/products/all');
        setProducts(res.data);
    };
    useEffect(() => { fetchProducts(); }, []);

    const openCreate = () => { setEditProduct(null); setForm({ name: '', description: '', price: '', stock: '', imageUrl: '' }); setShowModal(true); };
    const openEdit = (p) => { setEditProduct(p); setForm({ name: p.name, description: p.description, price: ethers.formatEther(p.price), stock: p.stock, imageUrl: p.imageUrl || '' }); setShowModal(true); };

    const handleSubmit = async () => {
        if (!signer) return alert("Connectez MetaMask");
        setLoading(true);
        try {
            const marketplace = new ethers.Contract(CONTRACT_ADDRESSES.marketplace, MARKETPLACE_ABI, signer);
            const priceWei = ethers.parseEther(form.price.toString());
            if (editProduct) {
                setTxStatus('Mise à jour on-chain...');
                const tx = await marketplace.updateProduct(editProduct.id, form.name, form.description, priceWei, parseInt(form.stock), editProduct.active, true, form.imageUrl);
                await tx.wait();
                await api.post('/api/products/sync', {
                    id: editProduct.id, name: form.name, description: form.description,
                    price: priceWei.toString(), stock: form.stock, active: editProduct.active, imageUrl: form.imageUrl, seller: await signer.getAddress()
                });
            } else {
                setTxStatus('Enregistrement on-chain...');
                const total = await marketplace.getTotalProducts();
                const newId = Number(total) + 1;
                const tx = await marketplace.addProduct(form.name, form.description, priceWei, parseInt(form.stock), form.imageUrl);
                await tx.wait();
                await api.post('/api/products/sync', {
                    id: newId, name: form.name, description: form.description,
                    price: priceWei.toString(), stock: form.stock, active: true, imageUrl: form.imageUrl, seller: await signer.getAddress()
                });
            }
            setTxStatus('✅ Succès!');
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            setTxStatus('❌ Erreur: ' + (err.reason || err.message));
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (p) => {
        if (!signer) return;
        try {
            const marketplace = new ethers.Contract(CONTRACT_ADDRESSES.marketplace, MARKETPLACE_ABI, signer);
            const tx = await marketplace.setProductStatus(p.id, !p.active, true);
            await tx.wait();
            await api.post('/api/products/sync', {
                id: p.id, name: p.name, description: p.description, price: p.price, stock: p.stock, active: !p.active, imageUrl: p.imageUrl, seller: p.seller
            });
            fetchProducts();
        } catch (err) { console.error(err); }
    };

    return (
        <div>
            <div className="tab-header">
                <h3 className="tab-title">Gestion des Produits</h3>
                <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Ajouter produit</button>
            </div>
            <div className="table-wrapper">
                <table className="admin-table">
                    <thead><tr>
                        <th>Image</th><th>Nom</th><th>Prix (ETH)</th><th>Stock</th><th>Statut</th><th>Actions</th>
                    </tr></thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td><img src={p.imageUrl || '/placeholder.png'} alt={p.name} className="table-img" /></td>
                                <td>{p.name}</td>
                                <td>{ethers.formatEther(p.price || '0')} ETH</td>
                                <td>{p.stock}</td>
                                <td><span className={`badge ${p.active ? 'badge-success' : 'badge-danger'}`}>{p.active ? 'Actif' : 'Inactif'}</span></td>
                                <td>
                                    <button className="btn-icon" onClick={() => openEdit(p)} title="Modifier"><Edit size={16} /></button>
                                    <button className="btn-icon" onClick={() => toggleStatus(p)} title="Toggle">
                                        {p.active ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal show={showModal} onClose={() => setShowModal(false)} title={editProduct ? "Modifier produit" : "Nouveau produit"}>
                <div className="form-group">
                    <label>Nom</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nom du produit" />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Prix (ETH)</label>
                        <input className="form-input" type="number" step="0.001" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Stock</label>
                        <input className="form-input" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Image</label>
                    <ImageUploader currentUrl={form.imageUrl} onUpload={url => setForm({ ...form, imageUrl: url })} token={token} />
                </div>
                {txStatus && <p className="tx-status">{txStatus}</p>}
                <button className="btn-primary full-width" onClick={handleSubmit} disabled={loading}>
                    {loading ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
                    {editProduct ? ' Mettre à jour' : ' Créer produit'}
                </button>
            </Modal>
        </div>
    );
};

// ───── VEHICLES TAB ─────
const VehiclesTab = ({ token, signer }) => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editVehicle, setEditVehicle] = useState(null);
    const [form, setForm] = useState({ model: '', plateNumber: '', dailyPrice: '', vehicleType: 'car', imageUrl: '' });
    const [txStatus, setTxStatus] = useState('');

    const fetchVehicles = async () => {
        const res = await api.get('/api/vehicles/all');
        setVehicles(res.data);
    };
    useEffect(() => { fetchVehicles(); }, []);

    const openCreate = () => { setEditVehicle(null); setForm({ model: '', plateNumber: '', dailyPrice: '', vehicleType: 'car', imageUrl: '' }); setShowModal(true); };
    const openEdit = (v) => { setEditVehicle(v); setForm({ model: v.model, plateNumber: v.plateNumber, dailyPrice: ethers.formatEther(v.dailyPrice), vehicleType: v.vehicleType || 'car', imageUrl: v.imageUrl || '' }); setShowModal(true); };

    const handleSubmit = async () => {
        if (!signer) return alert("Connectez MetaMask");
        setLoading(true);
        try {
            const booking = new ethers.Contract(CONTRACT_ADDRESSES.booking, BOOKING_ABI, signer);
            const priceWei = ethers.parseEther(form.dailyPrice.toString());
            if (editVehicle) {
                setTxStatus('Mise à jour on-chain...');
                const tx = await booking.updateVehicle(editVehicle.id, form.model, form.plateNumber, priceWei, editVehicle.available, form.vehicleType, form.imageUrl);
                await tx.wait();
                await api.post('/api/vehicles/sync', {
                    id: editVehicle.id, model: form.model, plateNumber: form.plateNumber,
                    dailyPrice: priceWei.toString(), available: editVehicle.available, vehicleType: form.vehicleType, imageUrl: form.imageUrl
                });
            } else {
                setTxStatus('Enregistrement on-chain...');
                const total = await booking.getTotalVehicles();
                const newId = Number(total) + 1;
                const tx = await booking.addVehicle(form.model, form.plateNumber, priceWei, form.vehicleType, form.imageUrl);
                await tx.wait();
                await api.post('/api/vehicles/sync', {
                    id: newId, model: form.model, plateNumber: form.plateNumber,
                    dailyPrice: priceWei.toString(), available: true, vehicleType: form.vehicleType, imageUrl: form.imageUrl
                });
            }
            setTxStatus('✅ Succès!');
            setShowModal(false);
            fetchVehicles();
        } catch (err) {
            setTxStatus('❌ Erreur: ' + (err.reason || err.message));
        } finally { setLoading(false); }
    };

    const toggleAvailability = async (v) => {
        if (!signer) return;
        try {
            const booking = new ethers.Contract(CONTRACT_ADDRESSES.booking, BOOKING_ABI, signer);
            const tx = await booking.updateVehicle(v.id, v.model, v.plateNumber, v.dailyPrice, !v.available, v.vehicleType || 'car', v.imageUrl || '');
            await tx.wait();
            await api.post('/api/vehicles/sync', {
                id: v.id, model: v.model, plateNumber: v.plateNumber,
                dailyPrice: v.dailyPrice, available: !v.available, vehicleType: v.vehicleType, imageUrl: v.imageUrl
            });
            fetchVehicles();
        } catch (err) { console.error(err); }
    };

    return (
        <div>
            <div className="tab-header">
                <h3 className="tab-title">Gestion des Véhicules</h3>
                <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Ajouter véhicule</button>
            </div>
            <div className="table-wrapper">
                <table className="admin-table">
                    <thead><tr>
                        <th>Image</th><th>Modèle</th><th>Plaque</th><th>Type</th><th>Prix/Jour</th><th>Dispo</th><th>Actions</th>
                    </tr></thead>
                    <tbody>
                        {vehicles.map(v => (
                            <tr key={v.id}>
                                <td><img src={v.imageUrl || '/placeholder.png'} alt={v.model} className="table-img" /></td>
                                <td>{v.model}</td>
                                <td>{v.plateNumber}</td>
                                <td><span className="badge badge-info">{v.vehicleType}</span></td>
                                <td>{ethers.formatEther(v.dailyPrice || '0')} ETH</td>
                                <td><span className={`badge ${v.available ? 'badge-success' : 'badge-warning'}`}>{v.available ? 'Disponible' : 'Loué'}</span></td>
                                <td>
                                    <button className="btn-icon" onClick={() => openEdit(v)}><Edit size={16} /></button>
                                    <button className="btn-icon" onClick={() => toggleAvailability(v)}>
                                        {v.available ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal show={showModal} onClose={() => setShowModal(false)} title={editVehicle ? "Modifier véhicule" : "Nouveau véhicule"}>
                <div className="form-group">
                    <label>Modèle</label>
                    <input className="form-input" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="Toyota Land Cruiser" />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Immatriculation</label>
                        <input className="form-input" value={form.plateNumber} onChange={e => setForm({ ...form, plateNumber: e.target.value })} placeholder="AA-123-BB" />
                    </div>
                    <div className="form-group">
                        <label>Type</label>
                        <select className="form-input" value={form.vehicleType} onChange={e => setForm({ ...form, vehicleType: e.target.value })}>
                            <option value="car">Voiture</option>
                            <option value="moto">Moto</option>
                            <option value="truck">Camion</option>
                            <option value="van">Van</option>
                            <option value="suv">SUV</option>
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label>Prix par jour (ETH)</label>
                    <input className="form-input" type="number" step="0.001" value={form.dailyPrice} onChange={e => setForm({ ...form, dailyPrice: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Image</label>
                    <ImageUploader currentUrl={form.imageUrl} onUpload={url => setForm({ ...form, imageUrl: url })} token={token} />
                </div>
                {txStatus && <p className="tx-status">{txStatus}</p>}
                <button className="btn-primary full-width" onClick={handleSubmit} disabled={loading}>
                    {loading ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
                    {editVehicle ? ' Mettre à jour' : ' Créer véhicule'}
                </button>
            </Modal>
        </div>
    );
};

// ───── USERS TAB ─────
const UsersTab = ({ token, signer }) => {
    const [users, setUsers] = useState([]);
    const fetchUsers = async () => {
        const res = await api.get('/api/admin/users');
        setUsers(res.data);
    };
    useEffect(() => { fetchUsers(); }, []);

    const toggleDeactivate = async (u) => {
        await api.patch(`/api/admin/user/${u.address}/deactivate`, { deactivated: !u.isDeactivated });
        fetchUsers();
    };

    const grantEmployee = async (u) => {
        if (!signer) return;
        try {
            const ac = new ethers.Contract(CONTRACT_ADDRESSES.accessControl, ACCESS_CONTROL_ABI, signer);
            if (u.role === 'EMPLOYEE') {
                const tx = await ac.removeEmployee(u.address);
                await tx.wait();
            } else {
                const tx = await ac.addEmployee(u.address);
                await tx.wait();
            }
            await api.patch(`/api/admin/user/${u.address}/role`, {
                role: u.role === 'EMPLOYEE' ? 'CLIENT' : 'EMPLOYEE'
            });
            fetchUsers();
        } catch (err) { console.error(err); }
    };

    return (
        <div>
            <div className="tab-header">
                <h3 className="tab-title">Gestion des Utilisateurs</h3>
                <button className="btn-secondary" onClick={fetchUsers}><RefreshCw size={16} /> Rafraîchir</button>
            </div>
            <div className="table-wrapper">
                <table className="admin-table">
                    <thead><tr>
                        <th>Adresse</th><th>Rôle</th><th>Statut</th><th>Inscrit le</th><th>Actions</th>
                    </tr></thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="address-cell">{u.address.substring(0, 8)}...{u.address.slice(-6)}</td>
                                <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-purple' : u.role === 'EMPLOYEE' ? 'badge-info' : 'badge-default'}`}>{u.role}</span></td>
                                <td><span className={`badge ${u.isDeactivated ? 'badge-danger' : 'badge-success'}`}>{u.isDeactivated ? 'Bloqué' : 'Actif'}</span></td>
                                <td>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                                <td>
                                    <button className="btn-icon" onClick={() => toggleDeactivate(u)} title={u.isDeactivated ? 'Réactiver' : 'Désactiver'}>
                                        {u.isDeactivated ? <ToggleLeft size={18} color="#10b981" /> : <ToggleRight size={18} color="#ef4444" />}
                                    </button>
                                    {u.role !== 'ADMIN' && (
                                        <button className="btn-icon" onClick={() => grantEmployee(u)} title={u.role === 'EMPLOYEE' ? 'Retirer employé' : 'Ajouter employé'}>
                                            <UserCheck size={16} color={u.role === 'EMPLOYEE' ? '#f59e0b' : '#6366f1'} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ───── ORDERS TAB ─────
const OrdersTab = ({ token }) => {
    const [orders, setOrders] = useState([]);
    const fetchOrders = async () => {
        const res = await api.get('/api/admin/orders');
        setOrders(res.data);
    };
    useEffect(() => { fetchOrders(); }, []);

    return (
        <div>
            <div className="tab-header">
                <h3 className="tab-title">Toutes les Commandes</h3>
                <button className="btn-secondary" onClick={fetchOrders}><RefreshCw size={16} /> Rafraîchir</button>
            </div>
            <div className="table-wrapper">
                <table className="admin-table">
                    <thead><tr>
                        <th>#</th><th>Produit</th><th>Acheteur</th><th>Montant</th><th>Statut</th><th>Date</th>
                    </tr></thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id}>
                                <td>#{o.id}</td>
                                <td>{o.product?.name || '-'}</td>
                                <td className="address-cell">{o.buyer.substring(0, 8)}...{o.buyer.slice(-6)}</td>
                                <td>{ethers.formatEther(o.amount || '0')} ETH</td>
                                <td><span className={`badge ${o.status === 'PAID' ? 'badge-success' : 'badge-info'}`}>{o.status}</span></td>
                                <td>{new Date(o.timestamp).toLocaleDateString('fr-FR')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ───── MAIN ADMIN DASHBOARD ─────
const AdminDashboard = () => {
    const { token, signer, chainId, switchNetwork } = useWeb3();
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState({});

    const fetchStats = async () => {
        try {
            const res = await api.get('/api/admin/stats');
            setStats(res.data);
        } catch (err) { console.error("Stats error:", err); }
    };

    useEffect(() => { if (token) fetchStats(); }, [token]);

    const tabs = [
        { id: 'stats', icon: BarChart3, label: 'Statistiques' },
        { id: 'products', icon: ShoppingCart, label: 'Produits' },
        { id: 'vehicles', icon: Car, label: 'Véhicules' },
        { id: 'users', icon: Users, label: 'Utilisateurs' },
        { id: 'orders', icon: Package, label: 'Commandes' },
    ];

    return (
        <div className="admin-dashboard">
            <div className="admin-sidebar">
                <div className="sidebar-header">
                    <LayoutDashboard size={20} />
                    <span>Admin Panel</span>
                </div>
                <nav className="sidebar-nav">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            <div className="admin-content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {chainId !== 31337n && (
                            <div className="alert alert-warning mb-6 flex items-center justify-between gap-4" style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '1rem', borderRadius: '0.5rem', color: '#92400e', marginBottom: '1.5rem' }}>
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={20} />
                                    <span><strong>Attention:</strong> MetaMask n'est pas connecté au réseau Hardhat (Chain ID 31337). Vos transactions vont échouer.</span>
                                </div>
                                <button onClick={switchNetwork} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                                    Basculer sur Hardhat
                                </button>
                            </div>
                        )}
                        {activeTab === 'stats' && <StatsTab stats={stats} />}
                        {activeTab === 'products' && <ProductsTab token={token} signer={signer} />}
                        {activeTab === 'vehicles' && <VehiclesTab token={token} signer={signer} />}
                        {activeTab === 'users' && <UsersTab token={token} signer={signer} />}
                        {activeTab === 'orders' && <OrdersTab token={token} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminDashboard;
