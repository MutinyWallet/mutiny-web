
import initMutinyWallet, { MutinyWallet } from '@mutinywallet/mutiny-wasm';
import initWaila from '@mutinywallet/waila-wasm'

// export type MutinyWalletSettingStrings = {
//     network?: string, proxy?: string, esplora?: string, rgs?: string, lsp?: string,
// }

type Network = "bitcoin" | "testnet" | "regtest" | "signet";
export type MutinyWalletSettingStrings = {
    network?: Network, proxy?: string, esplora?: string, rgs?: string, lsp?: string,
}

export function getExistingSettings(): MutinyWalletSettingStrings {
    const network = localStorage.getItem('MUTINY_SETTINGS_network') || import.meta.env.VITE_NETWORK;
    const proxy = localStorage.getItem('MUTINY_SETTINGS_proxy') || import.meta.env.VITE_PROXY;
    const esplora = localStorage.getItem('MUTINY_SETTINGS_esplora') || import.meta.env.VITE_ESPLORA;
    const rgs = localStorage.getItem('MUTINY_SETTINGS_rgs') || import.meta.env.VITE_RGS;
    const lsp = localStorage.getItem('MUTINY_SETTINGS_lsp') || import.meta.env.VITE_LSP;

    return { network, proxy, esplora, rgs, lsp }
}

export async function setAndGetMutinySettings(settings?: MutinyWalletSettingStrings): Promise<MutinyWalletSettingStrings> {
    let { network, proxy, esplora, rgs, lsp } = settings || {};

    const existingSettings = getExistingSettings();
    try {
        network = network || existingSettings.network;
        proxy = proxy || existingSettings.proxy;
        esplora = esplora || existingSettings.esplora;
        rgs = rgs || existingSettings.rgs;
        lsp = lsp || existingSettings.lsp;

        if (!network || !proxy || !esplora) {
            throw new Error("Missing a default setting for network, proxy, or esplora. Check your .env file to make sure it looks like .env.sample")
        }

        localStorage.setItem('MUTINY_SETTINGS_network', network);
        localStorage.setItem('MUTINY_SETTINGS_proxy', proxy);
        localStorage.setItem('MUTINY_SETTINGS_esplora', esplora);

        if (!rgs || !lsp) {
            console.warn("RGS or LSP not set")
        }

        rgs && localStorage.setItem('MUTINY_SETTINGS_rgs', rgs);
        lsp && localStorage.setItem('MUTINY_SETTINGS_lsp', lsp);

        return { network, proxy, esplora, rgs, lsp }
    } catch (error) {
        console.error(error)
        throw error
    }
}

export async function checkForWasm() {
    try {
        if (typeof WebAssembly === "object"
            && typeof WebAssembly.instantiate === "function") {
            const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
            if (!(module instanceof WebAssembly.Module)) {
                throw new Error("Couldn't instantiate WASM Module")
            }
        } else {
            throw new Error("No WebAssembly global object found")
        }
    } catch (e) {
        console.error(e)
    }
}

export async function setupMutinyWallet(settings?: MutinyWalletSettingStrings): Promise<MutinyWallet> {
    await initMutinyWallet();
    // Might as well init waila while we're at it
    await initWaila();

    console.time("Setup");
    console.log("Starting setup...")
    const { network, proxy, esplora, rgs, lsp } = await setAndGetMutinySettings(settings)
    console.log("Initializing Mutiny Manager")
    console.log("Using network", network);
    console.log("Using proxy", proxy);
    console.log("Using esplora address", esplora);
    console.log("Using rgs address", rgs);
    console.log("Using lsp address", lsp);

    const mutinyWallet = await new MutinyWallet("", undefined, proxy, network, esplora, rgs, lsp)

    const nodes = await mutinyWallet.list_nodes();

    // If we don't have any nodes yet, create one
    if (!nodes.length) {
        await mutinyWallet?.new_node()
    }

    return mutinyWallet
}