// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: '/', // Firebase Hosting (root path)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase chunk
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Charts chunk
          charts: ['recharts'],
          // UI components chunk
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-avatar'],
          // React chunk
          react: ['react', 'react-dom'],
          // Date utilities
          date: ['date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Increase limit to 600kb
  }
})