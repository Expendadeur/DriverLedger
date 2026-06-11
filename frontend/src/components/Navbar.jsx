import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useCart } from '../context/CartContext';
import { LogOut, User, Zap, Menu, X, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
    const { t } = useTranslation();
    const { account, user, login, logout } = useWeb3();
    const { getItemsCount } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 px-2 sm:px-6 py-2 sm:py-8">
            <div className="max-w-7xl mx-auto glass-morphism rounded-2xl sm:rounded-3xl px-3 sm:px-8 py-2 sm:py-5 flex items-center justify-between border border-white/40 shadow-2xl relative">
                <div className="flex items-center space-x-2 lg:space-x-12">
                    <Link to="/" className="flex items-center space-x-2 group text-decoration-none">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:rotate-12 transition-all duration-500 shrink-0">
                            <Zap className="text-white fill-current" size={16} />
                        </div>
                        <span className="text-lg sm:text-2xl font-black tracking-tighter text-slate-800 hidden md:block">Drive<span className="text-blue-600">Ledger</span></span>
                    </Link>

                    <div className="hidden lg:flex items-center space-x-8">
                        <NavLink to="/" className={({ isActive }) => `text-sm font-bold uppercase tracking-widest hover:text-blue-600 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>{t('nav.home')}</NavLink>
                        <NavLink to="/marketplace" className={({ isActive }) => `text-sm font-bold uppercase tracking-widest hover:text-blue-600 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>{t('common.marketplace')}</NavLink>
                        <NavLink to="/booking" className={({ isActive }) => `text-sm font-bold uppercase tracking-widest hover:text-blue-600 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>{t('common.booking')}</NavLink>
                        {user && (
                            <NavLink to="/dashboard" className={({ isActive }) => `text-sm font-bold uppercase tracking-widest hover:text-blue-600 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>{t('common.dashboard')}</NavLink>
                        )}
                        {user?.role === 'ADMIN' && (
                            <NavLink to="/admin" className={({ isActive }) => `text-sm font-bold uppercase tracking-widest hover:text-blue-600 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>{t('common.admin')}</NavLink>
                        )}
                        {(user?.role === 'EMPLOYEE' || user?.role === 'ADMIN') && (
                            <NavLink to="/scanner" className={({ isActive }) => `text-sm font-bold uppercase tracking-widest hover:text-blue-600 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>{t('common.scanner')}</NavLink>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
                    <div className="hidden md:block">
                        <LanguageSelector />
                    </div>

                    <Link to="/cart" className="relative p-2 sm:px-5 sm:py-3 bg-slate-100 text-slate-600 rounded-xl sm:rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all group flex items-center space-x-2">
                        <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
                        <span className="font-bold hidden sm:block text-sm uppercase tracking-wider">{t('common.cart')}</span>
                        {getItemsCount() > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white text-[10px] sm:text-xs font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                            >
                                {getItemsCount()}
                            </motion.span>
                        )}
                    </Link>

                    {account ? (
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="text-right hidden md:block">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.role || "CLIENT"}</p>
                                <p className="text-sm font-bold text-slate-800">{account.slice(0, 6)}...{account.slice(-4)}</p>
                            </div>
                            <button onClick={logout} className="p-2 sm:p-3 bg-slate-100 text-slate-500 rounded-xl sm:rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
                                <LogOut size={18} className="sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={login}
                            className="bg-blue-600 text-white p-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95 shrink-0"
                        >
                            <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                            <span className="hidden sm:inline text-xs sm:text-base whitespace-nowrap">{t('common.connectWallet')}</span>
                        </button>
                    )}

                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 sm:p-3 bg-white border border-slate-100 rounded-xl sm:rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shrink-0">
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute top-full left-0 right-0 mt-4 mx-2"
                        >
                            <div className="glass-morphism rounded-[2rem] p-8 border border-white/40 shadow-2xl flex flex-col space-y-6">
                                <NavLink onClick={() => setIsMenuOpen(false)} to="/" className="text-xl font-bold text-slate-800">{t('nav.home')}</NavLink>
                                <NavLink onClick={() => setIsMenuOpen(false)} to="/marketplace" className="text-xl font-bold text-slate-800">{t('common.marketplace')}</NavLink>
                                <NavLink onClick={() => setIsMenuOpen(false)} to="/booking" className="text-xl font-bold text-slate-800">{t('common.booking')}</NavLink>
                                {user && <NavLink onClick={() => setIsMenuOpen(false)} to="/dashboard" className="text-xl font-bold text-slate-800">{t('common.dashboard')}</NavLink>}
                                {user?.role === 'ADMIN' && <NavLink onClick={() => setIsMenuOpen(false)} to="/admin" className="text-xl font-bold text-slate-800">{t('common.admin')}</NavLink>}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default Navbar;
