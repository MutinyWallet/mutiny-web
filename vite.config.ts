import child from "node:child_process";
import path from "node:path";
import { defineConfig } from "vite";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";
import solid from "vite-plugin-solid";
import wasm from "vite-plugin-wasm";

import manifest from "./manifest";

const commitHash =
    process.env.VITE_COMMIT_HASH ??
    child.execSync("git rev-parse --short HEAD").toString().trim();

const pwaOptions: Partial<VitePWAOptions> = {
    base: "/",
    registerType: "prompt",
    devOptions: {
        enabled: false
    },
    workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,svg,png,gif,wasm}"],
        // mutiny_wasm is 10mb, so we'll do 25mb to be safe
        maximumFileSizeToCacheInBytes: 25 * 1024 * 1024
    },
    includeAssets: ["favicon.ico", "robots.txt"],
    manifest: manifest
};

export default defineConfig({
    build: {
        target: "esnext",
        outDir: "dist/public",
        emptyOutDir: true
    },
    server: {
        port: 3420,
        fs: {
            // Allow serving files from one level up (so that if mutiny-node is a sibling folder we can use it locally)
            allow: [".."]
        }
    },
    plugins: [wasm(), solid(), VitePWA(pwaOptions)],
    define: {
        "import.meta.env.__COMMIT_HASH__": JSON.stringify(commitHash),
        "import.meta.env.__RELEASE_VERSION__": JSON.stringify(
            process.env.npm_package_version
        )
    },
    resolve: {
        alias: [{ find: "~", replacement: path.resolve(__dirname, "./src") }]
    },
    optimizeDeps: {
        // Don't want vite to bundle these late during dev causing reload
        include: [
            "qr-scanner",
            "@solid-primitives/upload",
            "i18next",
            "i18next-browser-languagedetector",
            "@capacitor-mlkit/barcode-scanning",
            "@capacitor/app",
            "@capacitor/app-launcher",
            "@capacitor/clipboard",
            "@capacitor/core",
            "@capacitor/filesystem",
            "@capacitor/haptics",
            "@capacitor/share",
            "@capacitor/status-bar",
            "@capacitor/toast"
        ],
        // This is necessary because otherwise `vite dev` can't find the wasm
        exclude: ["@mutinywallet/mutiny-wasm"]
    }
});
