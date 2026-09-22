import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CineScore',
        short_name: 'CineScore',
        theme_color: '#04060C',
        background_color: '#04060C',
        display: 'standalone',
        icons: [
          {
            src: '/cinescore-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/cinescore-logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/cinescore-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})