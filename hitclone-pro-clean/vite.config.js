import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: './',
  publicDir: 'public',
  base: '/',
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: false,
    open: true,
    cors: true,
    hmr: {
      port: 3001
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html', // Only build the main index.html
      output: {
        manualChunks: undefined,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'd3'],
    force: true // Replace server.force
  },
  preview: {
    host: 'localhost',
    port: 3000,
    strictPort: false,
    open: true
  }
})