import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Scan, QrCode, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useWeb3 } from '../context/Web3Context';
import { motion, AnimatePresence } from 'framer-motion';

const EmployeeScanner = () => {
    const { t } = useTranslation();
    const { token, signer } = useWeb3();
    const [reservations, setReservations] = useState([]);
    const [status, setStatus] = useState('idle');
    const [scanResult, setScanResult] = useState(null);

    useEffect(() => {
        if (token) fetchTodayReservations();
    }, [token]);

    const fetchTodayReservations = async () => {
        try {
            const res = await api.get('/api/employee/reservations-today');
            setReservations(res.data);
        } catch (err) { console.error(err); }
    };

    const updateOrderStatus = async (id, newStatus) => {
        if (!signer) return;
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESSES.marketplace, MARKETPLACE_ABI, signer);
            const tx = await contract.updateOrderStatus(id, newStatus);
            await tx.wait();
            alert(`Order #${id} marked as ${newStatus} on-chain!`);
        } catch (err) { alert(err.message); }
    };

    const updateReservationStatus = async (id, newStatus) => {
        if (!signer) return;
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESSES.booking, BOOKING_ABI, signer);
            const tx = await contract.updateReservationStatus(id, newStatus);
            await tx.wait();
            alert(`Reservation #${id} marked as ${newStatus} on-chain!`);
        } catch (err) { alert(err.message); }
    };

    const handleScan = async () => {
        setStatus('scanning');
        const dummyHash = "0x789...abc";

        try {
            const res = await api.post('/api/scan/validate', { data: dummyHash });
            setScanResult(res.data);
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 py-12">
            <header className="text-center space-y-4">
                <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-3xl mb-4">
                    <Scan size={40} />
                </div>
                <h2 className="text-4xl font-black text-slate-800">{t('scanner.title')}</h2>
                <p className="text-slate-500 font-medium text-lg">{t('scanner.desc')}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <main className="glass-morphism rounded-[3rem] p-12 border border-white/40 shadow-2xl overflow-hidden relative h-fit">
                    <AnimatePresence mode="wait">
                        {status === 'idle' && (
                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                                <div className="w-48 h-48 border-4 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center mb-10">
                                    <QrCode size={64} className="text-slate-200" />
                                </div>
                                <button onClick={handleScan} className="btn-premium px-12 py-5 text-xl">
                                    {t('scanner.open')}
                                </button>
                            </motion.div>
                        )}

                        {status === 'scanning' && (
                            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-10">
                                <Loader2 size={64} className="text-blue-600 animate-spin mb-6" />
                                <p className="text-xl font-bold text-slate-600">{t('scanner.scanning')}</p>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-8">
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                    <ShieldCheck size={48} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 mb-2">{t('scanner.valid')}</h3>
                                    <div className="bg-slate-50 p-6 rounded-2xl text-left space-y-3">
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('scanner.type')}: <span className="text-slate-800">{scanResult.type}</span></p>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('scanner.id')}: <span className="text-slate-800">#{scanResult.data.id}</span></p>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('scanner.customer')}: <span className="text-slate-800">{scanResult.data.buyer || scanResult.data.client}</span></p>
                                    </div>
                                    {scanResult.type === 'ORDER' && (
                                        <div className="mt-6 flex gap-2">
                                            <button onClick={() => updateOrderStatus(scanResult.data.id, 'SHIPPED')} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Mark Shipped</button>
                                            <button onClick={() => updateOrderStatus(scanResult.data.id, 'DELIVERED')} className="flex-1 py-3 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Mark Delivered</button>
                                        </div>
                                    )}
                                    {scanResult.type === 'RESERVATION' && (
                                        <div className="mt-6 flex gap-2">
                                            <button onClick={() => updateReservationStatus(scanResult.data.id, 'COMPLETED')} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Mark Completed</button>
                                            <button onClick={() => updateReservationStatus(scanResult.data.id, 'CANCELLED')} className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel Booking</button>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => setStatus('idle')} className="text-blue-600 font-bold hover:underline">
                                    Scan Another
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-800 flex items-center space-x-3">
                        <div className="w-2 h-8 bg-blue-600 rounded-full" />
                        <span>TODAY'S RESERVATIONS</span>
                    </h3>
                    <div className="space-y-4">
                        {reservations.length === 0 ? (
                            <div className="p-8 bg-slate-50 rounded-3xl text-center text-slate-400 font-medium border-2 border-dashed border-slate-100">
                                No reservations for today
                            </div>
                        ) : (
                            reservations.map(res => (
                                <div key={res.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="font-black text-slate-800">{res.vehicle.model}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{res.client.slice(0, 10)}...</p>
                                    </div>
                                    <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                        Confirmed
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeScanner;
