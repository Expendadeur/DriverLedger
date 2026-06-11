import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

const Cart = () => {
    const { t } = useTranslation();
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
    const navigate = useNavigate();

    const goToCheckout = () => {
        if (cart.length === 0) return;
        navigate('/checkout');
    };

    if (cart.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
            >
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-400">
                    <ShoppingCart size={40} />
                </div>
                <h2 className="text-3xl font-black mb-4">{t('cart.empty')}</h2>
                <Link to="/marketplace" className="btn-premium inline-flex items-center">
                    {t('common.explore')} <ArrowRight size={18} className="ml-2" />
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <header>
                <h2 className="text-5xl font-black mb-2">{t('cart.title')}</h2>
                <p className="text-slate-500 font-medium">{cart.length} {t('cart.items')}</p>
            </header>

            <div className="space-y-6">
                {cart.map((item) => (
                    <motion.div
                        key={item.id}
                        layout
                        className="glass-morphism rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between border border-white/40 shadow-xl"
                    >
                        <div className="flex items-center space-x-6 w-full md:w-auto">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                                <img src={item.imageUrl || item.image || "/placeholder.png"} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black">{item.name}</h3>
                                <p className="text-blue-600 font-bold">{ethers.formatEther(item.price)} ETH</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-8 mt-6 md:mt-0">
                            <div className="flex items-center bg-slate-100 rounded-xl p-1">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-8 h-8 flex items-center justify-center font-bold hover:bg-white rounded-lg transition-colors"
                                >-</button>
                                <span className="w-12 text-center font-black">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center font-bold hover:bg-white rounded-lg transition-colors"
                                >+</button>
                            </div>
                            <p className="text-lg font-black w-24 text-right">
                                {ethers.formatEther(BigInt(item.price) * BigInt(item.quantity))} ETH
                            </p>
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-3 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="border-t border-slate-200 pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{t('cart.total')}</p>
                    <p className="text-5xl font-black text-slate-900">{ethers.formatEther(getCartTotal())} <span className="text-blue-600 text-2xl">ETH</span></p>
                </div>
                <button
                    onClick={goToCheckout}
                    className="w-full md:w-auto btn-premium px-12 py-6 text-xl flex items-center justify-center group"
                >
                    {t('cart.checkout')}
                    <ArrowRight size={24} className="ml-3 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default Cart;
