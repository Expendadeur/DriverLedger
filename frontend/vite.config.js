import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        allowedHosts: true,
        proxy: {
            // Proxy uniquement en développement local
            '/api': 'http://localhost:5000'
        }
    }
})
