/// <reference types="node" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite';    // ← make sure this line is present
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          cookieDomainRewrite: ''  
        },
        '/auth': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          cookieDomainRewrite: ''  
        },
        '/socket.io': {
          target: 'ws://localhost:3001',
          ws: true,
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
