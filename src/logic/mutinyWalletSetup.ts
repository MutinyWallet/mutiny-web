/* @refresh reload */

import initMutinyWallet, { MutinyWallet } from "@mutinywallet/mutiny-wasm";

export type Network = "bitcoin" | "testnet" | "regtest" | "signet";
export type MutinyWalletSettingStrings = {
    network?: Network;
    proxy?: string;
    esplora?: string;
    rgs?: string;
    lsp?: string;
    auth?: string;
    subscriptions?: string;
    storage?: string;
};

export function getExistingSettings(): MutinyWalletSettingStrings {
    const network =
        localStorage.getItem("MUTINY_SETTINGS_network") ||
        import.meta.env.VITE_NETWORK;
    const proxy =
        localStorage.getItem("MUTINY_SETTINGS_proxy") ||
        import.meta.env.VITE_PROXY;
    const esplora =
        localStorage.getItem("MUTINY_SETTINGS_esplora") ||
        import.meta.env.VITE_ESPLORA;
    const rgs =
        localStorage.getItem("MUTINY_SETTINGS_rgs") || import.meta.env.VITE_RGS;
    const lsp =
        localStorage.getItem("MUTINY_SETTINGS_lsp") || import.meta.env.VITE_LSP;
    const auth =
        localStorage.getItem("MUTINY_SETTINGS_auth") ||
        import.meta.env.VITE_AUTH;
    const subscriptions =
        localStorage.getItem("MUTINY_SETTINGS_subscriptions") ||
        import.meta.env.VITE_SUBSCRIPTIONS;
    const storage =
        localStorage.getItem("MUTINY_SETTINGS_storage") ||
        import.meta.env.VITE_STORAGE;

    return { network, proxy, esplora, rgs, lsp, auth, subscriptions, storage };
}

export async function setAndGetMutinySettings(
    settings?: MutinyWalletSettingStrings
): Promise<MutinyWalletSettingStrings> {
    let { network, proxy, esplora, rgs, lsp, auth, subscriptions, storage } =
        settings || {};

    const existingSettings = getExistingSettings();

    try {
        network = network || existingSettings.network;
        proxy = proxy || existingSettings.proxy;
        esplora = esplora || existingSettings.esplora;
        rgs = rgs || existingSettings.rgs;
        lsp = lsp || existingSettings.lsp;
        auth = auth || existingSettings.auth;
        subscriptions = subscriptions || existingSettings.subscriptions;
        storage = storage || existingSettings.storage;

        if (!network || !proxy || !esplora) {
            throw new Error(
                "Missing a default setting for network, proxy, or esplora. Check your .env file to make sure it looks like .env.sample"
            );
        }

        localStorage.setItem("MUTINY_SETTINGS_network", network);
        localStorage.setItem("MUTINY_SETTINGS_proxy", proxy);
        localStorage.setItem("MUTINY_SETTINGS_esplora", esplora);

        if (!rgs || !lsp) {
            console.warn("RGS or LSP not set");
        }

        rgs && localStorage.setItem("MUTINY_SETTINGS_rgs", rgs);
        lsp && localStorage.setItem("MUTINY_SETTINGS_lsp", lsp);
        auth && localStorage.setItem("MUTINY_SETTINGS_auth", auth);
        subscriptions &&
            localStorage.setItem(
                "MUTINY_SETTINGS_subscriptions",
                subscriptions
            );
        storage && localStorage.setItem("MUTINY_SETTINGS_storage", storage);

        return { network, proxy, esplora, rgs, lsp, auth, subscriptions, storage };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function checkForWasm() {
    try {
        if (
            typeof WebAssembly === "object" &&
            typeof WebAssembly.instantiate === "function"
        ) {
            const module = new WebAssembly.Module(
                Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
            );
            if (!(module instanceof WebAssembly.Module)) {
                throw new Error("Couldn't instantiate WASM Module");
            }
        } else {
            throw new Error("No WebAssembly global object found");
        }
    } catch (e) {
        console.error(e);
    }
}

export async function doubleInitDefense() {
    console.log("Starting init...");
    // Ultimate defense against getting multiple instances of the wallet running.
    // If we detect that the wallet has already been initialized in this session, we'll reload the page.
    // A successful stop of the wallet in onCleanup will clear this flag
    if (sessionStorage.getItem("MUTINY_WALLET_INITIALIZED")) {
        console.error(
            `Mutiny Wallet already initialized at ${sessionStorage.getItem(
                "MUTINY_WALLET_INITIALIZED"
            )}. Reloading page.`
        );
        sessionStorage.removeItem("MUTINY_WALLET_INITIALIZED");
        window.location.reload();
    }
}

export async function initializeWasm() {
    // Actually intialize the WASM, this should be the first thing that requires the WASM blob to be downloaded
    await initMutinyWallet();
}

export async function setupMutinyWallet(
    settings?: MutinyWalletSettingStrings,
    password?: string
): Promise<MutinyWallet> {
    console.log("Starting setup...");
    const { network, proxy, esplora, rgs, lsp, auth, subscriptions, storage } =
        await setAndGetMutinySettings(settings);
    console.log("Initializing Mutiny Manager");
    console.log("Using network", network);
    console.log("Using proxy", proxy);
    console.log("Using esplora address", esplora);
    console.log("Using rgs address", rgs);
    console.log("Using lsp address", lsp);
    console.log("Using auth address", auth);
    console.log("Using subscriptions address", subscriptions);
    console.log("Using storage address", storage);
    const mutinyWallet = await new MutinyWallet(
        // Password
        password ? password : undefined,
        // Mnemonic
        undefined,
        proxy,
        network,
        esplora,
        rgs,
        lsp,
        auth,
        subscriptions,
        storage,
        // Do not connect peers
        undefined
    );

    sessionStorage.setItem("MUTINY_WALLET_INITIALIZED", Date.now().toString());

    return mutinyWallet;
}
