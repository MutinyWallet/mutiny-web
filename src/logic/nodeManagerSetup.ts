
import init, { NodeManager } from '@mutinywallet/node-manager';

export type NodeManagerSettingStrings = {
    network?: string, proxy?: string, esplora?: string
}

export function getExistingSettings(): NodeManagerSettingStrings {
    const network = localStorage.getItem('MUTINY_SETTINGS_network') || import.meta.env.VITE_NETWORK;
    const proxy = localStorage.getItem('MUTINY_SETTINGS_proxy') || import.meta.env.VITE_PROXY;
    const esplora = localStorage.getItem('MUTINY_SETTINGS_esplora') || import.meta.env.VITE_ESPLORA;

    return { network, proxy, esplora }
}

export async function setAndGetMutinySettings(settings?: NodeManagerSettingStrings): Promise<NodeManagerSettingStrings> {
    let { network, proxy, esplora } = settings || {};

    const existingSettings = getExistingSettings();
    try {
        network = network || existingSettings.network;
        proxy = proxy || existingSettings.proxy;
        esplora = esplora || existingSettings.esplora;

        if (!network || !proxy || !esplora) {
            throw new Error("Missing a default setting for network, proxy, or esplora. Check your .env file to make sure it looks like .env.sample")
        }
        localStorage.setItem('MUTINY_SETTINGS_network', network);
        localStorage.setItem('MUTINY_SETTINGS_proxy', proxy);
        localStorage.setItem('MUTINY_SETTINGS_esplora', esplora);

        return { network, proxy, esplora }
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

export async function setupNodeManager(settings?: NodeManagerSettingStrings): Promise<NodeManager> {
    const _ = await init();

    console.time("Setup");
    console.log("Starting setup...")
    const { network, proxy, esplora } = await setAndGetMutinySettings(settings)
    console.log("Initializing Node Manager")
    console.log("Using network", network);
    console.log("Using proxy", proxy);
    console.log("Using esplora address", esplora);

    const nodeManager = await new NodeManager("", undefined, proxy, network, esplora)

    const nodes = await nodeManager.list_nodes();

    // If we don't have any nodes yet, create one
    if (!nodes.length) {
        await nodeManager?.new_node()
    }

    return nodeManager
}