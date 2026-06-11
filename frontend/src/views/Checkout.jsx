import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useWeb3 } from '../context/Web3Context';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { MARKETPLACE_ABI, CONTRACT_ADDRESSES } from '../services/contracts';

const Checkout = () => {
    const { t } = useTranslation();
    const { cart, getCartTotal, clearCart } = useCart();
    const { signer, account } = useWeb3();
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    const handlePayment = async () => {
        if (!signer) return alert(t('common.connectWallet'));
        setIsProcessing(true);
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESSES.marketplace, MARKETPLACE_ABI, signer);

            for (const item of cart) {
                for (let i = 0; i < item.quantity; i++) {
                    const tx = await contract.purchaseProduct(item.id, {
                        value: item.price
                    });
                    await tx.wait();
                }
            }

            alert(t('cart.orderSuccess'));
            clearCart();
            navigate('/dashboard'); 
        } catch (err) {
            console.error("Payment failed", err);
            alert(t('common.error'));
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-3xl font-black mb-4">{t('cart.empty')}</h2>
                <Link to="/marketplace" className="btn-premium inline-flex items-center">
                    <ArrowLeft size={18} className="mr-2" /> {t('common.explore')}
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <header className="flex items-center space-x-6">
                <Link to="/cart" className="p-3 bg-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h2 className="text-4xl font-black">{t('checkout.title')}</h2>
                    <p className="text-slate-500 font-medium">{t('checkout.summary')}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                <div className="lg:col-span-3 space-y-6">
                    <h3 className="text-xl font-bold uppercase tracking-widest text-slate-400 mb-6">{t('checkout.orderItems')}</h3>
                    <div className="space-y-4">
                        {cart.map((item) => (
                            <div key={item.id} className="glass-morphism rounded-2xl p-4 flex items-center justify-between border border-white/40">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                        <img src={item.imageUrl || item.image || "/placeholder.png"} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{item.name}</h4>
                                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-black text-lg">
                                    {ethers.formatEther(BigInt(item.price) * BigInt(item.quantity))} <span className="text-sm text-blue-600">ETH</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="glass-morphism rounded-3xl p-8 border border-white/40 shadow-xl sticky top-32 space-y-8">
                        <div>
                            <h3 className="text-xl font-bold uppercase tracking-widest text-slate-400 mb-6">{t('checkout.paymentDetails')}</h3>
                            <div className="space-y-4 text-slate-600 font-medium">
                                <div className="flex justify-between items-center">
                                    <span>{t('cart.total')} ({cart.length} {t('cart.items')})</span>
                                    <span className="font-bold text-slate-900">{ethers.formatEther(getCartTotal())} ETH</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Network Fee</span>
                                    <span className="text-slate-400">Calculated by wallet</span>
                                </div>
                                <div className="pt-4 border-t border-slate-200 mt-4 flex justify-between items-end">
                                    <span className="text-lg font-bold text-slate-900">Total</span>
                                    <span className="text-3xl font-black text-blue-600">{ethers.formatEther(getCartTotal())} <span className="text-lg">ETH</span></span>
                                </div>
                            </div>
                        </div>

                        {!account ? (
                            <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100 text-sm font-medium flex items-center">
                                <ShieldCheck size={20} className="mr-3 flex-shrink-0" />
                                {t('common.connectWallet')}
                            </div>
                        ) : (
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full btn-premium py-5 flex items-center justify-center text-lg shadow-blue-500/25"
                            >
                                {isProcessing ? (
                                    <span>{t('common.loading')}...</span>
                                ) : (
                                    <>
                                        <CreditCard size={20} className="mr-3" />
                                        {t('checkout.payNow')}
                                    </>
                                )}
                            </button>
                        )}
                        <p className="text-center text-xs text-slate-400 flex items-center justify-center mt-4">
                            <ShieldCheck size={14} className="mr-1" />
                            Secured by DriveLedger Smart Contracts
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
