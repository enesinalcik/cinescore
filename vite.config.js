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
        theme_color: '#0B0C15',
        display: 'standalone'
      }
    })
  ]
})