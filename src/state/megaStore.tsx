/* @refresh reload */

// Inspired by https://github.com/solidjs/solid-realworld/blob/main/src/store/index.js
import {
    ParentComponent,
    createContext,
    createEffect,
    onCleanup,
    onMount,
    useContext
} from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import {
    MutinyWalletSettingStrings,
    setupMutinyWallet
} from "~/logic/mutinyWalletSetup";
import { MutinyBalance, MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { ParsedParams } from "~/routes/Scanner";
import { MutinyTagItem } from "~/utils/tags";
import { checkBrowserCompatibility } from "~/logic/browserCompatibility";
import eify from "~/utils/eify";
import { timeout } from "~/utils/timeout";
import { ActivityItem } from "~/components/Activity";

const MegaStoreContext = createContext<MegaStore>();

type UserStatus = undefined | "new_here" | "waitlisted" | "approved";

export type MegaStore = [
    {
        already_approved?: boolean;
        waitlist_id?: string;
        mutiny_wallet?: MutinyWallet;
        deleting: boolean;
        user_status: UserStatus;
        scan_result?: ParsedParams;
        balance?: MutinyBalance;
        is_syncing?: boolean;
        last_sync?: number;
        price: number;
        has_backed_up: boolean;
        dismissed_restore_prompt: boolean;
        wallet_loading: boolean;
        activity: ActivityItem[];
        setup_error?: Error;
        is_pwa: boolean;
        existing_tab_detected: boolean;
        subscription_timestamp?: number;
        readonly mutiny_plus: boolean;
        needs_password: boolean;
    },
    {
        fetchUserStatus(): Promise<UserStatus>;
        setupMutinyWallet(
            settings?: MutinyWalletSettingStrings,
            password?: string
        ): Promise<void>;
        deleteMutinyWallet(): Promise<void>;
        setWaitlistId(waitlist_id: string): void;
        setScanResult(scan_result: ParsedParams | undefined): void;
        sync(): Promise<void>;
        dismissRestorePrompt(): void;
        setHasBackedUp(): void;
        listTags(): Promise<MutinyTagItem[]>;
        syncActivity(): Promise<void>;
        checkBrowserCompat(): Promise<boolean>;
        checkForSubscription(justPaid?: boolean): Promise<void>;
    }
];

export const Provider: ParentComponent = (props) => {
    const [state, setState] = createStore({
        already_approved:
            import.meta.env.VITE_SELFHOSTED === "true" ||
            localStorage.getItem("already_approved") === "true",
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
        dismissed_restore_prompt:
            localStorage.getItem("dismissed_restore_prompt") === "true",
        wallet_loading: true,
        activity: [] as ActivityItem[],
        setup_error: undefined as Error | undefined,
        is_pwa: window.matchMedia("(display-mode: standalone)").matches,
        existing_tab_detected: false,
        subscription_timestamp: undefined as number | undefined,
        get mutiny_plus(): boolean {
            // No subscription
            if (!state.subscription_timestamp) return false;

            // Expired
            if (state.subscription_timestamp < Math.ceil(Date.now() / 1000))
                return false;
            else return true;
        },
        needs_password: false
    });

    const actions = {
        async fetchUserStatus(): Promise<UserStatus> {
            if (state.already_approved) {
                console.log("welcome back!");
                return "approved";
            }

            // Using a PWA
            if (state.is_pwa) {
                localStorage.setItem("already_approved", "true");
                return "approved";
            }

            // Got an invite link
            const urlParams = new URLSearchParams(window.location.search);
            const invite = urlParams.get("invite");
            if (invite === "true") {
                localStorage.setItem("already_approved", "true");
                return "approved";
            }

            if (!state.waitlist_id) {
                return "new_here";
            }

            try {
                const res = await fetch(
                    `https://waitlist.mutiny-waitlist.workers.dev/waitlist/${state.waitlist_id}`
                );
                const data = await res.json();

                if (data.approval_date) {
                    // Remember them so we don't have to check every time
                    localStorage.setItem("already_approved", "true");
                    return "approved";
                } else {
                    return "waitlisted";
                }
            } catch (e) {
                return "new_here";
            }
        },
        async checkForSubscription(justPaid?: boolean): Promise<void> {
            try {
                const timestamp = await state.mutiny_wallet?.check_subscribed();
                console.log("timestamp:", timestamp);
                if (timestamp) {
                    localStorage.setItem(
                        "subscription_timestamp",
                        timestamp?.toString()
                    );
                    setState({ subscription_timestamp: Number(timestamp) });
                }
            } catch (e) {
                if (justPaid) {
                    // we make a fake timestamp for 24 hours from now, in case the server is down
                    const timestamp = Math.ceil(Date.now() / 1000) + 86400;
                    setState({ subscription_timestamp: timestamp });
                }
                console.error(e);
            }
        },
        async setupMutinyWallet(
            settings?: MutinyWalletSettingStrings,
            password?: string
        ): Promise<void> {
            try {
                // If we're already in an error state there should be no reason to continue
                if (state.setup_error) {
                    throw state.setup_error;
                }

                setState({ wallet_loading: true });

                const mutinyWallet = await setupMutinyWallet(
                    settings,
                    password
                );

                // If we get this far then we don't need the password anymore
                setState({ needs_password: false });

                // Get balance optimistically
                const balance = await mutinyWallet.get_balance();

                // Subscription stuff. Skip if it's not already in localstorage
                let subscription_timestamp = undefined;
                const stored_subscription_timestamp = localStorage.getItem(
                    "subscription_timestamp"
                );
                // If we have a stored timestamp, check if it's still valid
                if (stored_subscription_timestamp) {
                    try {
                        const timestamp =
                            await mutinyWallet?.check_subscribed();

                        // Check that timestamp is a number
                        if (!timestamp || isNaN(Number(timestamp))) {
                            throw new Error("Timestamp is not a number");
                        }

                        subscription_timestamp = Number(timestamp);
                        localStorage.setItem(
                            "subscription_timestamp",
                            timestamp.toString()
                        );
                    } catch (e) {
                        console.error(e);
                    }
                }

                setState({
                    mutiny_wallet: mutinyWallet,
                    wallet_loading: false,
                    subscription_timestamp: subscription_timestamp,
                    balance
                });
            } catch (e) {
                console.error(e);
                if (eify(e).message === "Incorrect password entered.") {
                    setState({ needs_password: true });
                } else {
                    setState({ setup_error: eify(e) });
                }
            }
        },
        async deleteMutinyWallet(): Promise<void> {
            try {
                if (state.mutiny_wallet) {
                    await state.mutiny_wallet?.stop();
                }
                setState((prevState) => ({
                    ...prevState,
                    mutiny_wallet: undefined,
                    deleting: true
                }));
                MutinyWallet.import_json("{}");
            } catch (e) {
                console.error(e);
            }
        },
        setWaitlistId(waitlist_id: string) {
            setState({ waitlist_id });
        },
        async sync(): Promise<void> {
            try {
                if (state.mutiny_wallet && !state.is_syncing) {
                    setState({ is_syncing: true });
                    const newBalance = await state.mutiny_wallet?.get_balance();
                    const price =
                        await state.mutiny_wallet?.get_bitcoin_price();
                    setState({
                        balance: newBalance,
                        last_sync: Date.now(),
                        price: price || 0
                    });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setState({ is_syncing: false });
            }
        },
        async syncActivity(): Promise<void> {
            try {
                const activity = await state.mutiny_wallet?.get_activity();
                setState("activity", reconcile(activity, { merge: true }));
            } catch (e) {
                console.error(e);
            }
        },
        setScanResult(scan_result: ParsedParams) {
            setState({ scan_result });
        },
        setHasBackedUp() {
            localStorage.setItem("has_backed_up", "true");
            setState({ has_backed_up: true });
        },
        dismissRestorePrompt() {
            localStorage.setItem("dismissed_restore_prompt", "true");
            setState({ dismissed_restore_prompt: true });
        },
        async listTags(): Promise<MutinyTagItem[]> {
            try {
                return state.mutiny_wallet?.get_tag_items() as MutinyTagItem[];
            } catch (e) {
                console.error(e);
                return [];
            }
        },
        async checkBrowserCompat(): Promise<boolean> {
            try {
                return await checkBrowserCompatibility();
            } catch (e) {
                setState({ setup_error: eify(e) });
                return false;
            }
        }
    };

    onCleanup(() => {
        console.warn("Parent Component is being unmounted!!!");
        state.mutiny_wallet
            ?.stop()
            .then(() => {
                console.warn("Successfully stopped mutiny wallet");
                sessionStorage.removeItem("MUTINY_WALLET_INITIALIZED");
            })
            .catch((e) => {
                console.error("Error stopping mutiny wallet", e);
            });
    });

    // Fetch status from remote on load
    onMount(() => {
        // eslint-disable-next-line
        actions.fetchUserStatus().then((status) => {
            setState({ user_status: status });

            function handleExisting() {
                if (state.existing_tab_detected) {
                    setState({
                        setup_error: new Error(
                            "Existing tab detected, aborting setup"
                        )
                    });
                } else {
                    console.log("running setup node manager...");

                    actions
                        .setupMutinyWallet()
                        .then(() => console.log("node manager setup done"));

                    // Setup an event listener to stop the mutiny wallet when the page unloads
                    window.onunload = async (_e) => {
                        console.log("stopping mutiny_wallet");
                        await state.mutiny_wallet?.stop();
                        console.log("mutiny_wallet stopped");
                    };
                }
            }

            function handleGoodBrowser() {
                console.log("checking if any other tabs are open");
                // 500ms should hopefully be enough time for any tabs to reply
                timeout(500).then(handleExisting);
            }

            // Only load node manager when status is approved
            if (
                state.user_status === "approved" &&
                !state.mutiny_wallet &&
                !state.deleting
            ) {
                console.log("checking for browser compatibility...");
                actions.checkBrowserCompat().then(handleGoodBrowser);
            }
        });
    });

    // Be reactive to changes in waitlist_id
    createEffect(() => {
        state.waitlist_id
            ? localStorage.setItem("waitlist_id", state.waitlist_id)
            : localStorage.removeItem("waitlist_id");
    });

    createEffect(() => {
        const interval = setInterval(async () => {
            await actions.sync();
        }, 3 * 1000); // Poll every 3 seconds

        onCleanup(() => {
            clearInterval(interval);
        });
    });

    onMount(() => {
        const channel = new BroadcastChannel("tab-detector");

        // First we let everyone know we exist
        channel.postMessage({ type: "NEW_TAB" });

        channel.onmessage = (e) => {
            // If any tabs reply, we know there's an existing tab so abort setup
            if (e.data.type === "EXISTING_TAB") {
                console.debug("there's an existing tab");
                setState({ existing_tab_detected: true });
            }

            // If we get notified of a new tab, we let it know we exist
            if (e.data.type === "NEW_TAB") {
                console.debug("a new tab just came online");
                channel.postMessage({ type: "EXISTING_TAB" });
            }
        };

        onCleanup(() => {
            channel.close();
        });
    });

    const store = [state, actions] as MegaStore;

    return (
        <MegaStoreContext.Provider value={store}>
            {props.children}
        </MegaStoreContext.Provider>
    );
};

export function useMegaStore() {
    // This is a trick to narrow the typescript types: https://docs.solidjs.com/references/api-reference/component-apis/createContext
    const context = useContext(MegaStoreContext);
    if (!context) {
        throw new Error("useMegaStore: cannot find a MegaStoreContext");
    }
    return context;
}
