import initMutinyWallet, { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";

export type Network = "bitcoin" | "testnet" | "regtest" | "signet";

export type MutinyWalletSettingStrings = {
    network?: string;
    proxy?: string;
    esplora?: string;
    rgs?: string;
    lsp?: string;
    lsps_connection_string?: string;
    lsps_token?: string;
    auth?: string;
    subscriptions?: string;
    storage?: string;
    scorer?: string;
    selfhosted?: string;
    primal_api?: string;
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
        name: "lsps_connection_string",
        storageKey: "USER_SETTINGS_lsps_connection_string",
        default: import.meta.env.VITE_LSPS_CONNECTION_STRING
    },
    {
        name: "lsps_token",
        storageKey: "USER_SETTINGS_lsps_token",
        default: import.meta.env.VITE_LSPS_TOKEN
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
    },
    {
        name: "selfhosted",
        storageKey: "USER_SETTINGS_selfhosted",
        default: import.meta.env.VITE_SELFHOSTED
    },
    {
        name: "primal_api",
        storageKey: "USER_SETTINGS_primal_api",
        default: import.meta.env.VITE_PRIMAL
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

    // VITE_PROXY and VITE_STORAGE might be set as relative URLs when self-hosting, so we need to make them absolute
    const selfhosted = settings.selfhosted === "true";

    // Expect urls like /_services/proxy and /_services/storage
    if (selfhosted) {
        let base = window.location.origin;
        console.log("Self-hosted mode enabled, using base URL", base);
        const storage = settings.storage;
        if (storage && storage.startsWith("/")) {
            settings.storage = base + storage;
        }

        const proxy = settings.proxy;
        if (proxy && proxy.startsWith("/")) {
            if (base.startsWith("http://")) {
                base = base.replace("http://", "ws://");
            } else if (base.startsWith("https://")) {
                base = base.replace("https://", "wss://");
            }
            settings.proxy = base + proxy;
        }
    }

    if (!settings.network || !settings.proxy) {
        throw new Error(
            "Missing a default setting for network or proxy. Check your .env file to make sure it looks like .env.sample"
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

    // If WASM is already initialized, don't init twice
    try {
        const _sats_the_standard = MutinyWallet.convert_btc_to_sats(1);
        console.debug("MutinyWallet WASM already initialized, skipping init");
        return;
    } catch (e) {
        console.debug("MutinyWallet WASM about to be initialized");
        await initMutinyWallet();
    }
}

export async function setupMutinyWallet(
    settings: MutinyWalletSettingStrings,
    password?: string,
    safeMode?: boolean,
    shouldZapHodl?: boolean
): Promise<MutinyWallet> {
    console.log("Starting setup...");

    // https://developer.mozilla.org/en-US/docs/Web/API/Storage_API
    // Ask the browser to not clear storage
    if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().then((persistent) => {
            if (persistent) {
                console.log(
                    "Storage will not be cleared except by explicit user action"
                );
            } else {
                console.log(
                    "Storage may be cleared by the UA under storage pressure."
                );
            }
        });
    }

    const {
        network,
        proxy,
        esplora,
        rgs,
        lsp,
        lsps_connection_string,
        lsps_token,
        auth,
        subscriptions,
        storage,
        scorer,
        primal_api
    } = settings;

    let nsec;
    // get nsec from secure storage
    // TODO: might have to check Capacitor.isNativePlatform but I think it's fine
    try {
        const value = await SecureStoragePlugin.get({ key: "nsec" });
        nsec = value.value;
    } catch (e) {
        console.log("No nsec stored");
    }

    // if we didn't get an nsec from storage, try to use extension
    let extension_key;

    if (!nsec && Object.prototype.hasOwnProperty.call(window, "nostr")) {
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore ignore nostr not existing, only does if they have extension
            extension_key = await window.nostr.getPublicKey();
        } catch (_) {
            console.log("No NIP-07 extension");
        }
    }

    console.log("Initializing Mutiny Manager");
    console.log("Using network", network);
    console.log("Using proxy", proxy);
    console.log("Using esplora address", esplora);
    console.log("Using rgs address", rgs);
    console.log("Using lsp address", lsp);
    console.log("Using lsp connection string", lsps_connection_string);
    console.log("Using lsp token", lsps_token);
    console.log("Using auth address", auth);
    console.log("Using subscriptions address", subscriptions);
    console.log("Using storage address", storage);
    console.log("Using scorer address", scorer);
    console.log("Using primal api", primal_api);
    console.log(safeMode ? "Safe mode enabled" : "Safe mode disabled");
    console.log(shouldZapHodl ? "Hodl zaps enabled" : "Hodl zaps disabled");

    // Only use lsps if there's no lsp set
    const shouldUseLSPS = !lsp && lsps_connection_string && lsps_token;

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
        shouldUseLSPS ? lsps_connection_string : undefined,
        shouldUseLSPS ? lsps_token : undefined,
        auth,
        subscriptions,
        storage,
        scorer,
        // Do not connect peers
        undefined,
        // Do not skip device lock
        undefined,
        // Safe mode
        safeMode || undefined,
        // Skip hodl invoices? (defaults to true, so if shouldZapHodl is true that's when we pass false)
        shouldZapHodl ? false : undefined,
        // Nsec override
        nsec,
        // Nip7
        extension_key ? extension_key : undefined,
        // primal URL
        primal_api || "https://primal-cache.mutinywallet.com/api"
    );

    sessionStorage.setItem("MUTINY_WALLET_INITIALIZED", Date.now().toString());

    return mutinyWallet;
}
