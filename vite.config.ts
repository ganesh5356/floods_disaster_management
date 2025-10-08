import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  server: {
    proxy: {
      '/api/weather': {
        target: 'https://api.weatherapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/weather/, ''),
        secure: true,
      },
      '/api/weather-icon': {
        target: 'https://cdn.weatherapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/weather-icon/, ''),
        secure: true,
      },
    },
  },
});
