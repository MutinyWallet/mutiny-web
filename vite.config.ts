import solid from "solid-start/vite";
import { defineConfig } from "vite";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";
import wasm from "vite-plugin-wasm";

import * as path from 'path'

const pwaOptions: Partial<VitePWAOptions> = {
    base: "/",
    registerType: "autoUpdate",
    devOptions: {
        enabled: false
    },
    includeAssets: ["favicon.ico", "robots.txt"],
    manifest: {
        name: "Mutiny Wallet",
        short_name: "Mutiny",
        description: "A lightning wallet",
        theme_color: "#000",
        icons: [
            {
                src: "192.png",
                sizes: "192x192",
                type: "image/png"
            },
            {
                src: "512.png",
                sizes: "512x512",
                type: "image/png"
            },
            {
                src: "maskable_icon.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any maskable"
            }
        ]
    }
};

export default defineConfig({
    server: {
        port: 3420,
        fs: {
            // Allow serving files from one level up (so that if mutiny-node is a sibling folder we can use it locally)
            allow: [".."]
        }
    },
    plugins: [wasm(), solid({ ssr: false }), VitePWA(pwaOptions)],
    resolve: {
        alias: [{ find: "~", replacement: path.resolve(__dirname, "./src") }]
    },
    optimizeDeps: {
        // Don't want vite to bundle these late during dev causing reload
        include: [
            "qr-scanner",
            "nostr-tools",
            "class-variance-authority",
            "@kobalte/core",
            "@solid-primitives/upload",
            "i18next",
            "i18next-browser-languagedetector"
        ],
        // This is necessary because otherwise `vite dev` can't find the wasm
        exclude: ["@mutinywallet/mutiny-wasm", "@mutinywallet/waila-wasm"]
    }
});
