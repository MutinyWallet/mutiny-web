/* @refresh reload */

// Inspired by https://github.com/solidjs/solid-realworld/blob/main/src/store/index.js
import { ParentComponent, createContext, createEffect, onCleanup, onMount, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { MutinyWalletSettingStrings, setupMutinyWallet } from "~/logic/mutinyWalletSetup";
import { MutinyBalance, MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { ParsedParams } from "~/routes/Scanner";
import { MutinyTagItem } from "~/utils/tags";

const MegaStoreContext = createContext<MegaStore>();

type UserStatus = undefined | "new_here" | "waitlisted" | "approved" | "paid"

export type MegaStore = [{
    already_approved?: boolean,
    waitlist_id?: string;
    mutiny_wallet?: MutinyWallet;
    deleting: boolean;
    user_status: UserStatus;
    scan_result?: ParsedParams;
    balance?: MutinyBalance;
    is_syncing?: boolean;
    last_sync?: number;
    price: number
    has_backed_up: boolean,
    dismissed_restore_prompt: boolean,
    wallet_loading: boolean
    nwc_enabled: boolean
}, {
    fetchUserStatus(): Promise<UserStatus>;
    setupMutinyWallet(settings?: MutinyWalletSettingStrings): Promise<void>;
    deleteMutinyWallet(): Promise<void>;
    setWaitlistId(waitlist_id: string): void;
    setScanResult(scan_result: ParsedParams | undefined): void;
    sync(): Promise<void>;
    dismissRestorePrompt(): void;
    setHasBackedUp(): void;
    listTags(): Promise<MutinyTagItem[]>;
    setNwc(enabled: boolean): void;
}];

export const Provider: ParentComponent = (props) => {
    const [state, setState] = createStore({
        already_approved: import.meta.env.VITE_SELFHOSTED === "true" || localStorage.getItem("already_approved") === "true",
        waitlist_id: localStorage.getItem("waitlist_id"),
        mutiny_wallet: undefined as MutinyWallet | undefined,
        deleting: false,
        user_status: undefined as UserStatus,
        scan_result: undefined as ParsedParams | undefined,
        price: 0,
        has_backed_up: localStorage.getItem("has_backed_up") === "true",
        balance: undefined as MutinyBalance | undefined,
        last_sync: undefined as number | undefined,
        is_syncing: false,
        dismissed_restore_prompt: localStorage.getItem("dismissed_restore_prompt") === "true",
        wallet_loading: true,
        nwc_enabled: localStorage.getItem("nwc_enabled") === "true",
    });

    const actions = {
        async fetchUserStatus(): Promise<UserStatus> {
            if (state.already_approved) {
                console.log("welcome back!")
                return "approved"
            }

            if (!state.waitlist_id) {
                return "new_here"
            }

            try {
                const res = await fetch(`https://waitlist.mutiny-waitlist.workers.dev/waitlist/${state.waitlist_id}`)
                const data = await res.json();

                if (data.approval_date) {
                    // Remember them so we don't have to check every time
                    localStorage.setItem("already_approved", "true")
                    return "approved"
                } else {
                    return "waitlisted"
                }

            } catch (e) {
                return "new_here"
            }
        },
        async setupMutinyWallet(settings?: MutinyWalletSettingStrings): Promise<void> {
            try {
                setState({ wallet_loading: true })
                const mutinyWallet = await setupMutinyWallet(settings)
                // Get balance optimistically
                const balance = await mutinyWallet.get_balance();
                // start nwc if enabled
                if (state.nwc_enabled) {
                    const nodes = await mutinyWallet.list_nodes();
                    const firstNode = nodes[0] as string || "";
                    await mutinyWallet.start_nostr_wallet_connect(firstNode);
                }
                setState({ mutiny_wallet: mutinyWallet, wallet_loading: false, balance })
            } catch (e) {
                console.error(e)
            }
        },
        async deleteMutinyWallet(): Promise<void> {
            await state.mutiny_wallet?.stop();
            setState((prevState) => ({
                ...prevState,
                mutiny_wallet: undefined,
                deleting: true,
            }));
            MutinyWallet.import_json("{}");
            localStorage.clear();
        },
        setWaitlistId(waitlist_id: string) {
            setState({ waitlist_id })
        },
        async sync(): Promise<void> {
            try {
                if (state.mutiny_wallet && !state.is_syncing) {
                    setState({ is_syncing: true })
                    const newBalance = await state.mutiny_wallet?.get_balance();
                    const price = await state.mutiny_wallet?.get_bitcoin_price();
                    setState({ balance: newBalance, last_sync: Date.now(), price: price || 0 })
                }
            } catch (e) {
                console.error(e);
            } finally {
                setState({ is_syncing: false })
            }
        },
        setScanResult(scan_result: ParsedParams) {
            setState({ scan_result })
        },
        setHasBackedUp() {
            localStorage.setItem("has_backed_up", "true")
            setState({ has_backed_up: true })
        },
        dismissRestorePrompt() {
            localStorage.setItem("dismissed_restore_prompt", "true")
            setState({ dismissed_restore_prompt: true })
        },
        async listTags(): Promise<MutinyTagItem[]> {
            return state.mutiny_wallet?.get_tag_items() as MutinyTagItem[]
        },
        setNwc(enabled: boolean) {
            localStorage.setItem("nwc_enabled", enabled.toString())
            setState({ nwc_enabled: enabled })
        }
    };

    // Fetch status from remote on load
    onMount(() => {
        // eslint-disable-next-line
        actions.fetchUserStatus().then(status => {
            setState({ user_status: status })

            // Only load node manager when status is approved
            if (state.user_status === "approved" && !state.mutiny_wallet && !state.deleting) {
                console.log("running setup node manager...")
                actions.setupMutinyWallet().then(() => console.log("node manager setup done"))

                // Setup an event listener to stop the mutiny wallet when the page unloads
                window.onunload = async (_e) => {
                    console.log("stopping mutiny_wallet")
                    await state.mutiny_wallet?.stop();
                    console.log("mutiny_wallet stopped")
                }
            }
        })
    })

    // Be reactive to changes in waitlist_id
    createEffect(() => {
        state.waitlist_id ? localStorage.setItem("waitlist_id", state.waitlist_id) : localStorage.removeItem("waitlist_id");
    });

    createEffect(() => {
      const interval = setInterval(async () => {
        await actions.sync();
      }, 30 * 1000); // Poll every 30 seconds

      onCleanup(() => {
        clearInterval(interval);
      });
    })

    const store = [state, actions] as MegaStore;

    return (
        <MegaStoreContext.Provider value={store}>
            {props.children}
        </MegaStoreContext.Provider>
    )
}

export function useMegaStore() {
    // This is a trick to narrow the typescript types: https://docs.solidjs.com/references/api-reference/component-apis/createContext
    const context = useContext(MegaStoreContext);
    if (!context) {
        throw new Error("useMegaStore: cannot find a MegaStoreContext")
    }
    return context;
}
