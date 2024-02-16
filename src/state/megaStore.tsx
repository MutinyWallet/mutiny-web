/* @refresh reload */

// Inspired by https://github.com/solidjs/solid-realworld/blob/main/src/store/index.js
import {
    MutinyBalance,
    MutinyWallet,
    TagItem
} from "@mutinywallet/mutiny-wasm";
import { useNavigate, useSearchParams } from "@solidjs/router";
import {
    createContext,
    onCleanup,
    onMount,
    ParentComponent,
    useContext
} from "solid-js";
import { createStore } from "solid-js/store";

import { checkBrowserCompatibility } from "~/logic/browserCompatibility";
import {
    doubleInitDefense,
    getSettings,
    initializeWasm,
    MutinyWalletSettingStrings,
    setupMutinyWallet
} from "~/logic/mutinyWalletSetup";
import { ParsedParams, toParsedParams } from "~/logic/waila";
import { MutinyFederationIdentity } from "~/routes/settings";
import {
    BTC_OPTION,
    Currency,
    eify,
    subscriptionValid,
    USD_OPTION
} from "~/utils";

const MegaStoreContext = createContext<MegaStore>();

type LoadStage =
    | "fresh"
    | "checking_double_init"
    | "downloading"
    | "setup"
    | "done";

type MegaStore = [
    {
        mutiny_wallet?: MutinyWallet;
        deleting: boolean;
        scan_result?: ParsedParams;
        balance?: MutinyBalance;
        is_syncing?: boolean;
        last_sync?: number;
        price_sync_backoff_multiple?: number;
        price: number;
        fiat: Currency;
        lang?: string;
        has_backed_up: boolean;
        wallet_loading: boolean;
        setup_error?: Error;
        is_pwa: boolean;
        existing_tab_detected: boolean;
        subscription_timestamp?: number;
        readonly mutiny_plus: boolean;
        needs_password: boolean;
        password?: string;
        load_stage: LoadStage;
        settings?: MutinyWalletSettingStrings;
        safe_mode?: boolean;
        npub?: string;
        preferredInvoiceType: "unified" | "lightning" | "onchain";
        testflightPromptDismissed: boolean;
        should_zap_hodl: boolean;
        federations?: MutinyFederationIdentity[];
    },
    {
        setup(password?: string): Promise<void>;
        deleteMutinyWallet(): Promise<void>;
        setScanResult(scan_result: ParsedParams | undefined): void;
        sync(): Promise<void>;
        setHasBackedUp(): void;
        listTags(): Promise<TagItem[]>;
        checkForSubscription(justPaid?: boolean): Promise<void>;
        fetchPrice(fiat: Currency): Promise<number>;
        saveFiat(fiat: Currency): void;
        saveLanguage(lang: string): void;
        saveNpub(npub: string): void;
        setPreferredInvoiceType(
            type: "unified" | "lightning" | "onchain"
        ): void;
        handleIncomingString(
            str: string,
            onError: (e: Error) => void,
            onSuccess: (value: ParsedParams) => void
        ): void;
        setTestFlightPromptDismissed(): void;
        toggleHodl(): void;
        dropMutinyWallet(): void;
        refreshFederations(): Promise<void>;
    }
];

export const Provider: ParentComponent = (props) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [state, setState] = createStore({
        mutiny_wallet: undefined as MutinyWallet | undefined,
        deleting: false,
        scan_result: undefined as ParsedParams | undefined,
        price: 0,
        fiat: localStorage.getItem("fiat_currency")
            ? (JSON.parse(localStorage.getItem("fiat_currency")!) as Currency)
            : USD_OPTION,
        has_backed_up: localStorage.getItem("has_backed_up") === "true",
        balance: undefined as MutinyBalance | undefined,
        last_sync: undefined as number | undefined,
        price_sync_backoff_multiple: 1,
        is_syncing: false,
        wallet_loading: true,
        setup_error: undefined as Error | undefined,
        is_pwa: window.matchMedia("(display-mode: standalone)").matches,
        existing_tab_detected: false,
        subscription_timestamp: undefined as number | undefined,
        get mutiny_plus(): boolean {
            // Make sure the subscription hasn't expired
            return subscriptionValid(state.subscription_timestamp);
        },
        needs_password: false,
        // If setup fails we can remember the password for checking the device lock
        password: undefined as string | undefined,
        load_stage: "fresh" as LoadStage,
        settings: undefined as MutinyWalletSettingStrings | undefined,
        safe_mode: searchParams.safe_mode === "true",
        lang: localStorage.getItem("i18nexLng") || undefined,
        npub: localStorage.getItem("npub") || undefined,
        preferredInvoiceType: "unified" as "unified" | "lightning" | "onchain",
        should_zap_hodl: localStorage.getItem("should_zap_hodl") === "true",
        testflightPromptDismissed:
            localStorage.getItem("testflightPromptDismissed") === "true",
        federations: undefined as MutinyFederationIdentity[] | undefined
    });

    const actions = {
        async checkForSubscription(justPaid?: boolean): Promise<void> {
            try {
                const timestamp = await state.mutiny_wallet?.check_subscribed();

                // Check that timestamp is a number
                if (timestamp && !isNaN(Number(timestamp))) {
                    setState({ subscription_timestamp: Number(timestamp) });
                } else if (justPaid) {
                    // we make a fake timestamp for 24 hours from now, in case the server is down
                    const timestamp = Math.ceil(Date.now() / 1000) + 86400;
                    setState({ subscription_timestamp: timestamp });
                }
            } catch (e) {
                console.error(e);
            }
        },
        async setup(password?: string): Promise<void> {
            try {
                // If we're already in an error state there should be no reason to continue
                if (state.setup_error) {
                    throw state.setup_error;
                }

                // If there's already a mutiny wallet in state abort!
                if (state.mutiny_wallet) {
                    setState({
                        setup_error: new Error(
                            "Existing Mutiny Wallet already running, aborting setup"
                        )
                    });
                    return;
                }

                setState({
                    wallet_loading: true,
                    load_stage: "checking_double_init"
                });

                await doubleInitDefense();
                setState({ load_stage: "downloading" });
                await initializeWasm();
                setState({ load_stage: "setup" });

                const settings = await getSettings();

                const mutinyWallet = await setupMutinyWallet(
                    settings,
                    password,
                    state.safe_mode,
                    state.should_zap_hodl
                );

                // Give other components access to settings via the store
                setState({ settings: settings });

                // If we get this far then we don't need the password anymore
                setState({ needs_password: false });

                // Check if we're subscribed and update the timestamp
                try {
                    const timestamp = await mutinyWallet?.check_subscribed();

                    // Check that timestamp is a number
                    if (timestamp && !isNaN(Number(timestamp))) {
                        setState({ subscription_timestamp: Number(timestamp) });
                    }
                } catch (e) {
                    console.error(e);
                }

                // Get balance
                const balance = await mutinyWallet.get_balance();

                // Get federations
                const federations =
                    (await mutinyWallet.list_federations()) as MutinyFederationIdentity[];

                setState({
                    mutiny_wallet: mutinyWallet,
                    wallet_loading: false,
                    load_stage: "done",
                    balance,
                    federations
                });
            } catch (e) {
                console.error(e);
                if (eify(e).message === "Incorrect password entered.") {
                    setState({ needs_password: true });
                } else {
                    // We only save the password for checking the timelock, will be blown away by the reload
                    setState({ setup_error: eify(e), password: password });
                }
            }
        },
        async deleteMutinyWallet(): Promise<void> {
            try {
                setState((prevState) => ({
                    ...prevState,
                    deleting: true
                }));
                if (state.mutiny_wallet) {
                    await state.mutiny_wallet?.stop();
                    await state.mutiny_wallet?.delete_all();
                }
            } catch (e) {
                console.error(e);
            }
        },
        async priceCheck(): Promise<void> {
            try {
                const price = await actions.fetchPrice(state.fiat);
                setState({
                    price: price || 0,
                    fiat: state.fiat,
                    price_sync_backoff_multiple: 1
                });
            } catch (e) {
                setState({
                    price: 1,
                    fiat: BTC_OPTION,
                    price_sync_backoff_multiple:
                        state.price_sync_backoff_multiple * 2
                });
            }
        },
        async sync(): Promise<void> {
            try {
                if (state.mutiny_wallet && !state.is_syncing) {
                    setState({ is_syncing: true });
                    const newBalance = await state.mutiny_wallet?.get_balance();
                    try {
                        setState({
                            balance: newBalance,
                            last_sync: Date.now(),
                            fiat: state.fiat
                        });
                    } catch (e) {
                        setState({
                            balance: newBalance,
                            last_sync: Date.now(),
                            fiat: BTC_OPTION
                        });
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setState({ is_syncing: false });
            }
        },
        async fetchPrice(fiat: Currency): Promise<number | undefined> {
            let price;
            if (fiat.value === "BTC") {
                price = 1;
                return price;
            } else {
                try {
                    price = await state.mutiny_wallet?.get_bitcoin_price(
                        fiat.value.toLowerCase() || "usd"
                    );
                    return price;
                } catch (e) {
                    console.error(e);
                    throw e;
                }
            }
        },
        setScanResult(scan_result: ParsedParams | undefined) {
            setState({ scan_result });
        },
        setHasBackedUp() {
            localStorage.setItem("has_backed_up", "true");
            setState({ has_backed_up: true });
        },
        async listTags(): Promise<TagItem[] | undefined> {
            try {
                return state.mutiny_wallet?.get_tag_items();
            } catch (e) {
                console.error(e);
                return [];
            }
        },
        async saveFiat(fiat: Currency) {
            localStorage.setItem("fiat_currency", JSON.stringify(fiat));
            const price = await actions.fetchPrice(fiat);
            setState({
                price: price,
                fiat: fiat
            });
        },
        saveLanguage(lang: string) {
            localStorage.setItem("i18nextLng", lang);
            setState({ lang });
        },
        saveNpub(npub: string) {
            localStorage.setItem("npub", npub);
            setState({ npub });
        },
        setPreferredInvoiceType(type: "unified" | "lightning" | "onchain") {
            setState({ preferredInvoiceType: type });
        },
        handleIncomingString(
            str: string,
            onError: (e: Error) => void,
            onSuccess: (value: ParsedParams) => void
        ): void {
            try {
                const url = new URL(str);
                if (url && url.pathname.startsWith("/gift")) {
                    navigate(url.pathname + url.search);
                    return;
                }

                if (url && url.pathname.startsWith("/settings/plus")) {
                    navigate(url.pathname + url.search);
                    return;
                }
            } catch (e) {
                // If it's not a URL, we'll just continue with normal parsing
            }

            const network = state.mutiny_wallet?.get_network() || "signet";
            const result = toParsedParams(str || "", network);
            if (!result.ok) {
                if (onError) {
                    onError(result.error);
                }
                return;
            } else {
                if (
                    result.value?.address ||
                    result.value?.payjoin_enabled ||
                    result.value?.invoice ||
                    result.value?.node_pubkey ||
                    (result.value?.lnurl && !result.value.is_lnurl_auth)
                ) {
                    if (onSuccess) {
                        onSuccess(result.value);
                    }
                }
                if (result.value?.lnurl && result.value?.is_lnurl_auth) {
                    navigate(
                        "/?lnurlauth=" + encodeURIComponent(result.value?.lnurl)
                    );
                    actions.setScanResult(undefined);
                }
                if (result.value?.fedimint_invite) {
                    navigate(
                        "/settings/federations?fedimint_invite=" +
                            encodeURIComponent(result.value?.fedimint_invite)
                    );
                    actions.setScanResult(undefined);
                }
                if (result.value?.nostr_wallet_auth) {
                    console.log(
                        "nostr_wallet_auth",
                        result.value?.nostr_wallet_auth
                    );
                    navigate(
                        "/settings/connections/?nwa=" +
                            encodeURIComponent(result.value?.nostr_wallet_auth)
                    );
                }
            }
        },
        setTestFlightPromptDismissed() {
            localStorage.setItem("testflightPromptDismissed", "true");
            setState({ testflightPromptDismissed: true });
        },
        toggleHodl() {
            const should_zap_hodl = !state.should_zap_hodl;
            localStorage.setItem("should_zap_hodl", should_zap_hodl.toString());
            setState({ should_zap_hodl });
        },
        dropMutinyWallet() {
            setState({ mutiny_wallet: undefined });
        },
        async refreshFederations() {
            const federations =
                (await state.mutiny_wallet?.list_federations()) as MutinyFederationIdentity[];
            setState({ federations });
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

    onMount(async () => {
        // Set up existing tab detector
        const channel = new BroadcastChannel("tab-detector");

        // First we let everyone know we exist
        channel.postMessage({ type: "NEW_TAB" });

        channel.onmessage = (e) => {
            // If any tabs reply, we know there's an existing tab so abort setup
            if (e.data.type === "EXISTING_TAB") {
                console.debug("there's an existing tab");
                setState({
                    existing_tab_detected: true,
                    setup_error: new Error(
                        "Existing tab detected, aborting setup"
                    )
                });
                return;
            }

            // If we get notified of a new tab, we let it know we exist
            if (e.data.type === "NEW_TAB") {
                console.debug("a new tab just came online");
                channel.postMessage({ type: "EXISTING_TAB" });
            }
        };

        console.log("checking for browser compatibility");
        try {
            await checkBrowserCompatibility();
        } catch (e) {
            setState({ setup_error: eify(e) });
            return;
        }

        // Setup catches its own errors and sets state itself
        console.log("running setup node manager");
        if (
            !state.mutiny_wallet &&
            !state.deleting &&
            !state.setup_error &&
            !state.existing_tab_detected
        ) {
            await actions.setup();
        } else {
            console.warn("setup aborted");
        }

        console.log("node manager setup done");

        // Setup an event listener to stop the mutiny wallet when the page unloads
        window.onunload = async (_e) => {
            console.log("stopping mutiny_wallet");
            await state.mutiny_wallet?.stop();
            console.log("mutiny_wallet stopped");
            sessionStorage.removeItem("MUTINY_WALLET_INITIALIZED");
        };

        // Set up syncing
        setInterval(async () => {
            await actions.sync();
        }, 3 * 1000); // Poll every 3 seconds

        // Run our first price check
        await actions.priceCheck();

        // Set up price checking every minute
        setInterval(
            async () => {
                await actions.priceCheck();
            },
            60 * 1000 * state.price_sync_backoff_multiple
        ); // Poll every minute * backoff multiple
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
