import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'
import packageJson from './package.json'

if (fs.existsSync(process.cwd()) && process.cwd() !== fs.realpathSync(process.cwd())) {
  process.chdir(fs.realpathSync(process.cwd()))
}

export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version)
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'pwa-192x192.png',
        'pwa-512x512.png',
        'icon-512.png',
        'sw-push-handler.js',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'favicon-48x48.png',
        'apple-touch-icon.png',
        'logo-header.png',
        'logo-clean-original.png',
        'site-bg-watermark.png',
        'og-image.png'
      ],
      manifestFilename: 'manifest.json',
      manifest: {
        id: '/',
        name: 'غردقة فور يو - Hurghada For You',
        short_name: 'غردقة فور يو',
        description: 'منظومة إدارة رحلات الغردقة البحرية والسياحية والتحصيل واليوميات - AXONID',
        theme_color: '#0a2540',
        background_color: '#0a2540',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        dir: 'rtl',
        lang: 'ar-EG',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/index.html',
        globIgnores: ['**/version.json'],
        importScripts: ['/sw-push-handler.js'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              networkTimeoutSeconds: 3,
              cacheName: 'html-cache'
            }
          },
          {
            urlPattern: /version\.json.*/i,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /\/(sw|registerSW)\.js.*/i,
            handler: 'NetworkOnly'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
          excel: ['exceljs']
        }
      }
    }
  },
  server: {
    port: 8030,
    strictPort: true,
    host: true,
    watch: {
      ignored: ['**/*.~tmp', '**/*.tmp']
    }
  }
})
