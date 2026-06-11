import { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWeb3 } from '../context/Web3Context';
import { useCart } from '../context/CartContext';
import { MARKETPLACE_ABI, CONTRACT_ADDRESSES } from '../services/contracts';
import { Filter, Tag, Star, ShoppingCart, Box } from 'lucide-react';

const Marketplace = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { signer, account } = useWeb3();
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/products');
            setProducts(res.data);
        } catch (err) {
            console.error("Failed to fetch products", err);
        }
    };

    const buyProduct = async (product) => {
        if (!signer) return alert(t('common.connectWallet'));
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESSES.marketplace, MARKETPLACE_ABI, signer);
            const tx = await contract.purchaseProduct(product.id, {
                value: product.price
            });
            await tx.wait();
            alert(t('marketplace.buySuccess'));
            fetchProducts();
        } catch (err) {
            console.error(err);
            alert(t('marketplace.buyError'));
        }
    };

    const filteredProducts = products.filter(p =>
        p.active && (
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-5xl font-black mb-4">{t('marketplace.title').split(' ')[0]} <span className="text-blue-600">{t('marketplace.title').split(' ')[1]}</span></h2>
                    <p className="text-slate-500 font-medium text-lg">{t('marketplace.subtitle')}</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('common.filter') + "..."}
                            className="input-premium pl-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredProducts.map((product, idx) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="card-premium group"
                    >
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-6 bg-slate-100">
                            <img
                                src={product.imageUrl || product.image || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-4 left-4 flex space-x-2">
                                <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-blue-600 shadow-sm flex items-center">
                                    <Tag size={12} className="mr-1" /> {t('common.premium')}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-2xl font-black truncate">{product.name}</h3>
                            <div className="flex items-center text-amber-500">
                                <Star size={16} fill="currentColor" />
                                <span className="text-sm font-bold ml-1 text-slate-700">4.9</span>
                            </div>
                        </div>

                        <p className="text-slate-500 font-medium mb-8 line-clamp-2">{product.description}</p>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('common.price')}</p>
                                <p className="text-2xl font-black text-slate-900">{ethers.formatEther(product.price)} <span className="text-blue-600 text-sm">ETH</span></p>
                            </div>
                            <button
                                onClick={() => {
                                    addToCart(product);
                                    alert(t('cart.added'));
                                }}
                                className="btn-premium px-6 py-4"
                            >
                                <ShoppingCart size={20} />
                            </button>
                        </div>

                        <div className="mt-6 flex items-center space-x-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center"><Box size={14} className="mr-1 text-blue-500" /> {product.stock} {t('common.stock')}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Marketplace;
