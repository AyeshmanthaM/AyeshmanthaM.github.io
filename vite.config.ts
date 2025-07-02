import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/' : '/',
  server: {
    host: 'localhost',
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://notion-cors-proxy.maduranga-ayeshmantha.workers.dev',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}));
