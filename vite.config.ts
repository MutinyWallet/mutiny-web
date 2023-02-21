import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig({

  plugins: [react(), VitePWA({
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    manifest: {
      name: 'Mutiny Wallet',
      short_name: 'Mutiny',
      description: 'A lightning wallet',
      theme_color: '#000',
      icons: [
        {
          src: '192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    registerType: 'autoUpdate', devOptions: {
      enabled: true
    }
  })],
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, './src') }]
  }
})
