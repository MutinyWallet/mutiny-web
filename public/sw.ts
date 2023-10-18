// /// <reference lib="WebWorker" />
// /// <reference types="vite/client" />
//
// import initMutinyWallet, { MutinyWallet } from "@mutinywallet/mutiny-wasm";
//
// // SERVICE WORKER SETUP STUFF
// declare let self: ServiceWorkerGlobalScope
//
// const entries = self.__WB_MANIFEST
//
// if (import.meta.env.DEV)
//     entries.push({ url: '/', revision: Math.random().toString() })
//
// // allow only fallback in dev: we don't want to cache anything
// let allowlist: undefined | RegExp[]
// if (import.meta.env.DEV)
//     allowlist = [/^\/$/]
//
// // deny api and server page calls
// let denylist: undefined | RegExp[]
// if (import.meta.env.PROD) {
//     denylist = [
//         /^\/sw.js$/,
//         // exclude webmanifest: has its own cache
//         /^\/manifest-(.*).webmanifest$/,
//     ]
// }
//
//
// ACTUAL LOGIC
console.log("hello from the service worker?")

self.addEventListener('push', (event) => {
    console.log("push event", event)
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});










