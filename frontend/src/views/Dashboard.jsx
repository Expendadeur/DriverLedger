import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useWeb3 } from '../context/Web3Context';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, User, QrCode, CheckCircle, FileText, Download, X } from 'lucide-react';

const Dashboard = () => {
    const { t } = useTranslation();
    const { user, token } = useWeb3();
    const [orders, setOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [activeQr, setActiveQr] = useState(null);

    useEffect(() => {
        if (token) {
            fetchOrders();
            fetchReservations();
        }
    }, [token]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/user/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchReservations = async () => {
        try {
            const res = await axios.get('/api/user/reservations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setReservations(res.data);
        } catch (err) { console.error(err); }
    };

    const downloadInvoice = async (id) => {
        window.open(`/api/files/invoice/${id}`, '_blank');
    };

    const showQR = async (txHash) => {
        try {
            const res = await axios.get(`/api/files/qr?data=${txHash}`);
            setActiveQr(res.data.qr);
        } catch (err) { console.error(err); }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-40 glass-morphism rounded-[3rem] border border-white/40">
                <User size={80} className="text-slate-300 mb-8" />
                <h3 className="text-2xl font-black text-slate-800">{t('dashboard.connectWall')}</h3>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-5xl font-black mb-2">{t('dashboard.title')}</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
                        {t('dashboard.role')}: <span className="text-blue-600">{user.role}</span>
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                {/* Marketplace Orders */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-3 text-2xl font-black">
                        <Package className="text-blue-600" />
                        <h3>{t('dashboard.orders')}</h3>
                    </div>
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="card-premium flex justify-between items-center p-6 border border-slate-100">
                                <div>
                                    <p className="text-xl font-black text-slate-800">{order.product.name}</p>
                                    <p className="text-sm font-bold text-slate-400">{new Date(order.timestamp).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button onClick={() => showQR(order.txHash)} className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100">
                                        <QrCode size={20} />
                                    </button>
                                    <button onClick={() => downloadInvoice(order.id)} className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100">
                                        <Download size={20} />
                                    </button>
                                    <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                                        Confirmed
                                    </span>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && <div className="p-12 text-center bg-slate-50 rounded-[2rem] text-slate-400 font-bold">{t('dashboard.noOrders')}</div>}
                    </div>
                </section>

                {/* Reservations */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-3 text-2xl font-black">
                        <Truck className="text-blue-600" />
                        <h3>{t('dashboard.reservations')}</h3>
                    </div>
                    <div className="space-y-4">
                        {reservations.map(res => (
                            <div key={res.id} className="card-premium flex justify-between items-center p-6 border border-slate-100">
                                <div>
                                    <p className="text-xl font-black text-slate-800">{res.vehicle.model}</p>
                                    <p className="text-sm font-bold text-slate-400">{new Date(res.startTime).toLocaleDateString()} - {new Date(res.endTime).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button onClick={() => showQR(res.txHash)} className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100">
                                        <QrCode size={20} />
                                    </button>
                                    <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                                        Active
                                    </span>
                                </div>
                            </div>
                        ))}
                        {reservations.length === 0 && <div className="p-12 text-center bg-slate-50 rounded-[2rem] text-slate-400 font-bold">{t('dashboard.noReservations')}</div>}
                    </div>
                </section>
            </div>

            {/* QR Modal */}
            <AnimatePresence>
                {activeQr && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-12 max-w-sm w-full relative shadow-2xl"
                        >
                            <button onClick={() => setActiveQr(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors">
                                <X size={24} />
                            </button>
                            <div className="text-center">
                                <h3 className="text-2xl font-black mb-8">Your Secure QR Code</h3>
                                <div className="bg-slate-50 p-6 rounded-[2rem] inline-block mb-8">
                                    <img src={activeQr} alt="QR Code" className="w-48 h-48" />
                                </div>
                                <p className="text-slate-500 font-medium">Scan this at any DriveLedger hub to validate your transaction.</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
