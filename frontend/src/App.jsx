import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';
import { Web3Provider } from './context/Web3Context';
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/Navbar';
import Home from './views/Home';
import Marketplace from './views/Marketplace';
import Booking from './views/Booking';
import Dashboard from './views/Dashboard';
import AdminDashboard from './views/AdminDashboard';
import EmployeeScanner from './views/EmployeeScanner';
import Cart from './views/Cart';
import Checkout from './views/Checkout';

// Connect to backend socket
const socket = io('http://localhost:5000');

function App() {
    const { t } = useTranslation();

    useEffect(() => {
        socket.on('ORDER_CONFIRMED', (order) => {
            alert(`New Order Confirmed! Product: ${order.product.name}`);
        });

        socket.on('RESERVATION_CONFIRMED', (res) => {
            alert(`Reservation Confirmed! Vehicle: ${res.vehicle.model}`);
        });

        socket.on('VEHICLE_UPDATED', (v) => {
            alert(`Vehicle Updated: ${v.model} is now ${v.available ? 'Available' : 'Out of Service'}`);
        });

        socket.on('PRODUCT_UPDATED', (p) => {
            alert(`Product Updated: ${p.name} status: ${p.active ? 'Active' : 'Archived'}`);
        });

        socket.on('USER_UPDATED', (u) => {
            alert(`User Status/Role Changed: ${u.address.slice(0, 10)}...`);
        });

        return () => {
            socket.off('ORDER_CONFIRMED');
            socket.off('RESERVATION_CONFIRMED');
            socket.off('VEHICLE_UPDATED');
            socket.off('PRODUCT_UPDATED');
            socket.off('USER_UPDATED');
        };
    }, []);

    return (
        <Web3Provider>
            <CartProvider>
                <Router>
                    <div className="min-h-screen bg-[#f8fafc] flex-col flex">
                        <Navbar />
                        <main className="flex-grow container mx-auto px-6 py-40">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/marketplace" element={<Marketplace />} />
                                <Route path="/booking" element={<Booking />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/admin" element={<AdminDashboard />} />
                                <Route path="/scanner" element={<EmployeeScanner />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/checkout" element={<Checkout />} />
                            </Routes>
                        </main>

                        <footer className="py-20 border-t border-slate-100 text-center text-slate-400 font-medium">
                            <p>{t('common.footer')}</p>
                        </footer>
                    </div>
                </Router>
            </CartProvider>
        </Web3Provider>
    );
}

export default App;
