import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }), 
    viteReact(), 
    tailwindcss()
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      buffer: 'buffer',
    },
  },
  define: {
    global: 'globalThis',
    process: { env: {} },
  },
});
