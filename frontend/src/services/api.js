import axios from 'axios';

// En production → URL Render | En local → '' (proxy Vite /api → localhost:5000)
const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: API_URL,
});

// Injecte automatiquement le token JWT dans chaque requête
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export default api;
