/* @refresh reload */

import initMutinyWallet, { MutinyWallet } from "@mutinywallet/mutiny-wasm";

export type Network = "bitcoin" | "testnet" | "regtest" | "signet";

export type MutinyWalletSettingStrings = {
    network?: string;
    proxy?: string;
    esplora?: string;
    rgs?: string;
    lsp?: string;
    auth?: string;
    subscriptions?: string;
    storage?: string;
    scorer?: string;
};

const SETTINGS_KEYS = [
    {
        name: "network",
        storageKey: "USER_SETTINGS_network",
        default: import.meta.env.VITE_NETWORK
    },
    {
        name: "proxy",
        storageKey: "USER_SETTINGS_proxy",
        default: import.meta.env.VITE_PROXY
    },
    {
        name: "esplora",
        storageKey: "USER_SETTINGS_esplora",
        default: import.meta.env.VITE_ESPLORA
    },
    {
        name: "rgs",
        storageKey: "USER_SETTINGS_rgs",
        default: import.meta.env.VITE_RGS
    },
    {
        name: "lsp",
        storageKey: "USER_SETTINGS_lsp",
        default: import.meta.env.VITE_LSP
    },
    {
        name: "auth",
        storageKey: "USER_SETTINGS_auth",
        default: import.meta.env.VITE_AUTH
    },
    {
        name: "subscriptions",
        storageKey: "USER_SETTINGS_subscriptions",
        default: import.meta.env.VITE_SUBSCRIPTIONS
    },
    {
        name: "storage",
        storageKey: "USER_SETTINGS_storage",
        default: import.meta.env.VITE_STORAGE
    },
    {
        name: "scorer",
        storageKey: "USER_SETTINGS_scorer",
        default: import.meta.env.VITE_SCORER
    }
];

function getItemOrDefault(
    storageKey: string,
    defaultValue: string
): string | undefined {
    const item = localStorage.getItem(storageKey);
    if (item === "") {
        return undefined;
    } else if (item === null) {
        return defaultValue;
    } else {
        return item;
    }
}

function setItemIfNotDefault(
    key: string,
    override: string,
    defaultValue: string
) {
    if (override === defaultValue) {
        localStorage.removeItem(key);
    } else {
        localStorage.setItem(key, override);
    }
}

export async function getSettings() {
    const settings = <MutinyWalletSettingStrings>{};

    SETTINGS_KEYS.forEach(({ name, storageKey, default: defaultValue }) => {
        const n = name as keyof MutinyWalletSettingStrings;
        const item = getItemOrDefault(storageKey, defaultValue);
        settings[n] = item as string;
    });

    if (!settings.network || !settings.proxy || !settings.esplora) {
        throw new Error(
            "Missing a default setting for network, proxy, or esplora. Check your .env file to make sure it looks like .env.sample"
        );
    }

    return settings;
}

export async function setSettings(newSettings: MutinyWalletSettingStrings) {
    SETTINGS_KEYS.forEach(({ name, storageKey, default: defaultValue }) => {
        const n = name as keyof MutinyWalletSettingStrings;
        const override = newSettings[n];
        // If the value is in the newSettings, and it's not the default, set it in localstorage
        // Also, "" is a valid value, so we only want to reject undefined
        if (override !== undefined) {
            setItemIfNotDefault(storageKey, override, defaultValue);
        }
    });
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
    settings: MutinyWalletSettingStrings,
    password?: string
): Promise<MutinyWallet> {
    console.log("Starting setup...");

    const {
        network,
        proxy,
        esplora,
        rgs,
        lsp,
        auth,
        subscriptions,
        storage,
        scorer
    } = settings;

    console.log("Initializing Mutiny Manager");
    console.log("Using network", network);
    console.log("Using proxy", proxy);
    console.log("Using esplora address", esplora);
    console.log("Using rgs address", rgs);
    console.log("Using lsp address", lsp);
    console.log("Using auth address", auth);
    console.log("Using subscriptions address", subscriptions);
    console.log("Using storage address", storage);
    console.log("Using scorer address", scorer);

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
        scorer,
        // Do not connect peers
        undefined,
        // Do not skip device lock
        undefined
    );

    sessionStorage.setItem("MUTINY_WALLET_INITIALIZED", Date.now().toString());

    return mutinyWallet;
}
