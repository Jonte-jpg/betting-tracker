// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        runtimeCaching: [
          // HTML shell – ensure we always try network first so new deploys surface
          {
            urlPattern: /.*index.html.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-shell',
              networkTimeoutSeconds: 3,
              cacheableResponse: { statuses: [0, 200] },
            }
          },
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              networkTimeoutSeconds: 3,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/identitytoolkit\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'auth-cache',
              networkTimeoutSeconds: 3,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        // Disable service worker in dev to avoid stale-cache confusion
        enabled: false,
      },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Betting Tracker',
        short_name: 'BetTracker',
        description: 'Track your betting history and statistics',
        theme_color: '#1f2937',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Conditional base path: root for web, relative for Tauri
  base: process.env.TAURI_BUILD === 'true' ? './' : '/',
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __APP_BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
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
    chunkSizeWarningLimit: 1600, // Increase for Tauri builds
  }
})