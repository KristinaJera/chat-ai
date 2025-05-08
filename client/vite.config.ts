// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-icons/fc']
  },
  server: {
    proxy: {
      // proxy any `/api/*` request to your backend on port 3001
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // proxy socket.io as well
      '/socket.io': {
        target: 'ws://localhost:3001',
        ws: true,
      },
    },
  },
});
