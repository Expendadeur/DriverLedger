import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Car, ShieldCheck, Zap, Globe, ArrowRight, Star, Tag, Gauge, Fuel } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { ethers } from 'ethers';

const Home = () => {
    const { t } = useTranslation();
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const prodRes = await axios.get('/api/products');
                setProducts(prodRes.data.slice(0, 3)); // Show top 3

                const vehRes = await axios.get('/api/vehicles');
                setVehicles(vehRes.data.slice(0, 2)); // Show top 2
            } catch (err) {
                console.error("Home data fetch error:", err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-32 pb-20">
            {/* Hero Section */}
            <section className="relative pt-20 overflow-hidden">
                <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="z-10"
                    >
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-bold text-sm mb-6 border border-blue-100 uppercase tracking-widest">
                            <Zap size={16} />
                            <span>{t('landing.web3Powered')}</span>
                        </div>
                        <h1 className="text-6xl lg:text-7xl font-black leading-tight mb-8">
                            {t('landing.heroTitle').split(' ').map((word, i) => (
                                <span key={i} className={word === 'On-Chain' || word === 'Blockchain' ? "text-blue-600" : ""}>
                                    {word}{' '}
                                </span>
                            ))}
                        </h1>
                        <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-lg">
                            {t('landing.heroDescription')}
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link to="/marketplace" className="btn-premium text-lg group">
                                {t('common.explore')}
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/booking" className="btn-premium-outline text-lg">
                                {t('landing.ctaSecondary')}
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-emerald-400/20 blur-[120px] rounded-full"></div>
                        <img
                            src="/images/hero_car_bg_1772169511700.png"
                            alt="Premium Car"
                            className="relative z-10 w-full h-auto rounded-[3rem] shadow-2xl border-4 border-white/50"
                        />
                        <div className="absolute -bottom-10 -left-10 z-20 glass-morphism p-6 rounded-3xl max-w-xs shadow-2xl bg-white/10 backdrop-blur-md">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-black">{t('landing.statsOnChain')}</p>
                                    <p className="text-sm font-semibold text-slate-500">{t('landing.statsVerified')}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Products Preview */}
            <section className="container mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-black mb-4">{t('landing.featuredProducts')}</h2>
                        <div className="h-1.5 w-20 bg-blue-600 rounded-full"></div>
                    </div>
                    <Link to="/marketplace" className="flex items-center text-blue-600 font-bold hover:underline">
                        {t('landing.viewAll')} <ArrowRight size={18} className="ml-2" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((p, idx) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="card-premium group"
                        >
                            <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 bg-slate-100">
                                <img src={p.imageUrl || "/placeholder.png"} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-blue-600 shadow-sm flex items-center">
                                        <Tag size={10} className="mr-1" /> {t('common.premium')}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-xl font-black mb-2 truncate">{p.name}</h3>
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-black text-blue-600">{ethers.formatEther(p.price || '0')} ETH</span>
                                <button
                                    onClick={() => {
                                        addToCart(p);
                                        alert(t('cart.added'));
                                    }}
                                    className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-blue-600 hover:text-white transition-colors"
                                >
                                    <ShoppingBag size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Vehicles Preview */}
            <section className="bg-slate-900 py-32 -mx-6 px-6 overflow-hidden">
                <div className="container mx-auto">
                    <div className="flex justify-between items-end mb-16 text-white text-center sm:text-left">
                        <div>
                            <h2 className="text-4xl font-black mb-4">{t('landing.availableVehicles')}</h2>
                            <div className="h-1.5 w-20 bg-blue-500 rounded-full mx-auto sm:mx-0"></div>
                        </div>
                        <Link to="/booking" className="hidden sm:flex items-center text-blue-400 font-bold hover:underline">
                            {t('landing.viewAll')} <ArrowRight size={18} className="ml-2" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {vehicles.map((v, idx) => (
                            <motion.div
                                key={v.id}
                                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex flex-col md:flex-row bg-white rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-blue-500/10"
                            >
                                <div className="md:w-1/2 relative bg-slate-100 min-h-[200px]">
                                    <img src={v.imageUrl || "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800"} alt={v.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                                </div>
                                <div className="md:w-1/2 p-8 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black mb-4 truncate">{v.model}</h3>
                                        <div className="flex space-x-4 mb-6">
                                            <div className="flex items-center space-x-2 text-slate-400">
                                                <Gauge size={14} /> <span className="text-xs font-bold">{v.speed || '250'} km/h</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-slate-400">
                                                <Fuel size={14} /> <span className="text-xs font-bold">{v.range || '500'} km</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t pt-6">
                                        <div className="text-xl font-black text-blue-600">{ethers.formatEther(v.dailyPrice || '0')} ETH <span className="text-[10px] text-slate-400 uppercase">/ Jour</span></div>
                                        <Link to="/booking" className="btn-premium p-3"><ArrowRight size={18} /></Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl lg:text-5xl font-black mb-6">{t('landing.featuresTitle')}</h2>
                    <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium">
                        {t('landing.featuresDesc')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<ShoppingBag />}
                        title={t('landing.feature1Title')}
                        desc={t('landing.feature1Desc')}
                        color="bg-blue-600"
                    />
                    <FeatureCard
                        icon={<Car />}
                        title={t('landing.feature2Title')}
                        desc={t('landing.feature2Desc')}
                        color="bg-emerald-600"
                    />
                    <FeatureCard
                        icon={<Globe />}
                        title={t('landing.feature3Title')}
                        desc={t('landing.feature3Desc')}
                        color="bg-indigo-600"
                    />
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc, color }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className="card-premium group"
    >
        <div className={`w-16 h-16 ${color} text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-${color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
            {React.cloneElement(icon, { size: 32 })}
        </div>
        <h3 className="text-2xl font-black mb-4">{title}</h3>
        <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
    </motion.div>
);

export default Home;
