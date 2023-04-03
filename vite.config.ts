import solid from "solid-start/vite";
import { defineConfig } from "vite";
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'

import * as path from 'path'

const pwaOptions: Partial<VitePWAOptions> = {
  registerType: "autoUpdate",
  devOptions: {
    enabled: true
  },
  includeAssets: ['favicon.ico', 'robots.txt'],
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
      },
      {
        src: 'maskable_icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  },
}

export default defineConfig({
  server: {
    port: 3420,
  },
  plugins: [solid({ ssr: false }), VitePWA(pwaOptions)],
  resolve: {
    alias: [{ find: '~', replacement: path.resolve(__dirname, './src') }]
  }
});
