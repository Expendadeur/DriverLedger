import { useState, useEffect } from 'react';
import api from '../services/api';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWeb3 } from '../context/Web3Context';
import { BOOKING_ABI, CONTRACT_ADDRESSES } from '../services/contracts';
import { Gauge, Fuel, Shield, ArrowRight } from 'lucide-react';

const Booking = () => {
    const { t } = useTranslation();
    const [vehicles, setVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { signer } = useWeb3();

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
        const res = await api.get('/api/vehicles');
            if (res.data.length === 0) {
                setVehicles([
                    { id: 1, model: "Tesla Model S Plaid", plateNumber: "DRV-001X", dailyPrice: ethers.parseEther("0.15").toString(), image: "/images/vehicle_placeholder_1_1772169559889.png", speed: "322 km/h", range: "637 km" },
                    { id: 2, model: "Porsche Taycan Turbo", plateNumber: "ELT-999Z", dailyPrice: ethers.parseEther("0.18").toString(), speed: "260 km/h", range: "450 km" },
                    { id: 3, model: "Lucid Air Dream", plateNumber: "LUX-777A", dailyPrice: ethers.parseEther("0.22").toString(), speed: "270 km/h", range: "837 km" }
                ]);
            } else {
                setVehicles(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch vehicles", err);
        }
    };

    const bookVehicle = async (vehicle) => {
        if (!signer) return alert(t('common.connectWallet'));
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESSES.booking, BOOKING_ABI, signer);
            const days = 1; // Default to 1 day for demo
            const tx = await contract.bookVehicle(vehicle.id, days, {
                value: (BigInt(vehicle.dailyPrice) * BigInt(days)).toString()
            });
            await tx.wait();
            alert(t('booking.bookSuccess'));
            fetchVehicles();
        } catch (err) {
            console.error(err);
            alert(t('booking.bookError'));
        }
    };

    const filteredVehicles = vehicles.filter(v =>
        v.available && (
            v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="space-y-16">
            <header className="relative py-20 bg-slate-900 rounded-[3rem] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-emerald-600/20"></div>
                <div className="relative z-10 text-center px-6">
                    <h2 className="text-6xl font-black text-white mb-6">
                        {t('booking.title').split(' ')[0]} <span className="text-blue-400">{t('booking.title').split(' ')[1]}</span>
                    </h2>
                    <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium">{t('booking.subtitle')}</p>

                    <div className="max-w-md mx-auto mt-10 relative">
                        <input
                            type="text"
                            placeholder={t('common.filter') + "..."}
                            className="w-full px-6 py-4 bg-white/10 rounded-2xl text-white outline-none border border-white/20 focus:bg-white/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {filteredVehicles.map((vehicle, idx) => (
                    <motion.div
                        key={vehicle.id}
                        initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col md:flex-row bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-xl group"
                    >
                        <div className="md:w-1/2 relative bg-slate-100 overflow-hidden">
                            <img
                                src={vehicle.image || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800"}
                                alt={vehicle.model}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
                                <div className="text-white">
                                    <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">{t('booking.dailyRate')}</p>
                                    <p className="text-3xl font-black">{ethers.formatEther(vehicle.dailyPrice)} ETH</p>
                                </div>
                            </div>
                        </div>

                        <div className="md:w-1/2 p-10 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-3xl font-black">{vehicle.model}</h3>
                                    <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                                        <Shield size={20} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Gauge size={18} /></div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{t('booking.topSpeed')}</p>
                                            <p className="text-sm font-bold">{vehicle.speed || "250 km/h"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Fuel size={18} /></div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{t('booking.range')}</p>
                                            <p className="text-sm font-bold">{vehicle.range || "500 km"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                                    <span>{t('booking.plate')}</span>
                                    <span>{vehicle.plateNumber}</span>
                                </div>
                                <button
                                    onClick={() => bookVehicle(vehicle)}
                                    className="w-full btn-premium py-5 text-lg group"
                                >
                                    {t('booking.confirmBooking')}
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Booking;
