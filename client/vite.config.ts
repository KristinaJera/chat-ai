/// <reference types="node" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_URL || 'http://localhost:3001';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      host: true,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          cookieDomainRewrite: '',
        },
        '/auth': {
          target,
          changeOrigin: true,
          cookieDomainRewrite: '',
        },
        '/socket.io': {
          target: target.replace(/^http/, 'ws'),
          ws: true,
        },
        '/uploads': {
          target,
          changeOrigin: true,
          cookieDomainRewrite: '',
        },
      },
    },
    preview: {
      port: 4174,
      host: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: env.VITE_GENERATE_SOURCEMAP === 'true',
    },
  };
});
