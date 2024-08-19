// Inspired by https://github.com/solidjs/solid-realworld/blob/main/src/store/index.js
import { MutinyBalance, TagItem } from "@mutinywallet/mutiny-wasm";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { Remote } from "comlink";
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
    MutinyWalletSettingStrings,
    Network,
    setSettings
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

type LoadStage =
    | "fresh"
    | "checking_double_init"
    | "downloading"
    | "checking_for_existing_wallet"
    | "setup"
    | "done";

export type WalletWorker = Remote<typeof import("../workers/walletWorker")>;

export const makeMegaStoreContext = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Not actually a shared worker, but it's the same code
    const sw = new ComlinkWorker<typeof import("../workers/walletWorker")>(
        new URL("../workers/walletWorker", import.meta.url),
        {
            type: "module"
        }
    );

    const [state, setState] = createStore({
        network: undefined as Network | undefined,
        deleting: false,
        scan_result: undefined as ParsedParams | undefined,
        price: 0,
        fiat: localStorage.getItem("fiat_currency")
            ? (JSON.parse(localStorage.getItem("fiat_currency")!) as Currency)
            : USD_OPTION,
        has_backed_up: localStorage.getItem("has_backed_up") === "true",
        balance: undefined as Partial<MutinyBalance> | undefined,
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
        preferredInvoiceType: "unified" as "unified" | "lightning" | "onchain",
        should_zap_hodl: localStorage.getItem("should_zap_hodl") === "true",
        testflightPromptDismissed:
            localStorage.getItem("testflightPromptDismissed") === "true",
        federations: undefined as MutinyFederationIdentity[] | undefined,
        balanceView: localStorage.getItem("balanceView") || "sats",
        expiration_warning: undefined as
            | {
                  expiresTimestamp: number;
                  expiresMessage: string;
                  federationName: string;
              }
            | undefined,
        expiration_warning_seen: false,
        shutdown_warning_seen: false
    });

    const actions = {
        async checkForSubscription(justPaid?: boolean): Promise<void> {
            try {
                const timestamp = await sw.check_subscribed();

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
        async preSetup(): Promise<boolean> {
            try {
                // If we're already in an error state there should be no reason to continue
                if (state.setup_error) {
                    throw state.setup_error;
                }

                setState({ wallet_loading: true });

                await this.checkForExistingTab();

                if (state.existing_tab_detected) {
                    return false;
                }

                console.log("checking for browser compatibility");
                try {
                    await checkBrowserCompatibility();
                } catch (e) {
                    setState({ setup_error: eify(e) });
                    return false;
                }

                setState({
                    wallet_loading: true,
                    load_stage: "checking_double_init"
                });

                await doubleInitDefense();

                setState({ load_stage: "downloading" });
                await sw.initializeWasm();

                setState({ load_stage: "checking_for_existing_wallet" });
                const existing = await sw.has_node_manager();

                if (!existing && !searchParams.skip_setup) {
                    navigate("/setup");
                    return false;
                }
                return true;
            } catch (e) {
                console.error(e);
                setState({ setup_error: eify(e) });
                return false;
            }
        },
        async setup(password?: string): Promise<void> {
            let interval: NodeJS.Timeout | undefined;
            try {
                const settings = await getSettings();
                setState({ load_stage: "setup" });

                // handle lsp settings
                if (searchParams.lsps) {
                    settings.lsp = "";
                    settings.lsps_connection_string = searchParams.lsps;
                    settings.lsps_token = searchParams.token;

                    await setSettings(settings);
                }

                // 90 seconds to load or we bail
                const start = Date.now();
                const MAX_LOAD_TIME = 90000;
                interval = setInterval(() => {
                    console.log("Running setup", Date.now() - start);
                    if (Date.now() - start > MAX_LOAD_TIME) {
                        clearInterval(interval);
                        // Only want to do this if we're really not done loading
                        if (state.load_stage !== "done") {
                            // Have to set state error here because throwing doesn't work if WASM panics
                            setState({
                                setup_error: new Error(
                                    "Load timed out, please try again"
                                )
                            });
                            return;
                        }
                    }
                }, 1000);

                let nsec;
                // get nsec from secure storage
                try {
                    const value = await SecureStoragePlugin.get({
                        key: "nsec"
                    });
                    nsec = value.value;
                } catch (e) {
                    console.log("No nsec stored");
                }

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
                } else {
                    console.warn(
                        "Persistent storage not supported, storage may be cleared by the UA under storage pressure."
                    );
                }

                const success = await sw.setupMutinyWallet(
                    settings,
                    password,
                    state.safe_mode,
                    state.should_zap_hodl,
                    nsec
                );

                if (!success) {
                    throw new Error("Failed to initialize mutiny wallet");
                }

                // Give other components access to settings via the store
                setState({ settings: settings });

                // If we get this far then we don't need the password anymore
                setState({ needs_password: false });

                // Get network
                const network = await sw.get_network();

                // Get balance
                const balance = await sw.get_balance();

                // Get federations
                const federations = await sw.list_federations();

                let expiration_warning:
                    | {
                          expiresTimestamp: number;
                          expiresMessage: string;
                          federationName: string;
                      }
                    | undefined = undefined;

                federations.forEach((f) => {
                    if (f.popup_countdown_message && f.popup_end_timestamp) {
                        expiration_warning = {
                            expiresTimestamp: f.popup_end_timestamp,
                            expiresMessage: f.popup_countdown_message,
                            federationName: f.federation_name
                        };
                    }
                });

                setState({
                    wallet_loading: false,
                    load_stage: "done",
                    balance,
                    federations,
                    network: network as Network,
                    expiration_warning
                });

                console.log("Wallet initialized");

                clearInterval(interval);

                await actions.postSetup();
            } catch (e) {
                // clear the interval if it exists
                if (interval) {
                    clearInterval(interval);
                }

                console.error(e);
                if (eify(e).message === "Incorrect password entered.") {
                    setState({ needs_password: true });
                } else {
                    // We only save the password for checking the timelock, will be blown away by the reload
                    setState({ setup_error: eify(e), password: password });
                }
            }
        },
        async postSetup(): Promise<void> {
            if (!sw) {
                console.error(
                    "Unable to run post setup, no mutiny_wallet is set"
                );
                return;
            }

            // Check if we're subscribed and update the timestamp
            try {
                const timestamp = await sw.check_subscribed();
                // Check that timestamp is a number
                if (timestamp && !isNaN(Number(timestamp))) {
                    setState({ subscription_timestamp: Number(timestamp) });
                }
            } catch (e) {
                console.error("error checking subscription", e);
            }

            // Set up syncing
            setInterval(async () => {
                await actions.sync();
            }, 3 * 1000); // Poll every 3 seconds

            // Run our first price check
            console.log("running first price check");
            await actions.priceCheck();

            // Set up price checking every minute
            setInterval(
                async () => {
                    await actions.priceCheck();
                },
                60 * 1000 * state.price_sync_backoff_multiple
            ); // Poll every minute * backoff multiple
        },
        async deleteMutinyWallet(): Promise<void> {
            try {
                setState((prevState) => ({
                    ...prevState,
                    deleting: true
                }));
                if (sw) {
                    await sw.stop();
                    await sw.delete_all();
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
                if (sw && !state.is_syncing) {
                    setState({ is_syncing: true });
                    const newBalance = await sw.get_balance();
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
                    price = await sw.get_bitcoin_price(
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
                return sw.get_tag_items();
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
        setPreferredInvoiceType(type: "unified" | "lightning" | "onchain") {
            setState({ preferredInvoiceType: type });
        },
        async handleIncomingString(
            str: string,
            onError: (e: Error) => void,
            onSuccess: (value: ParsedParams) => void
        ): Promise<void> {
            try {
                const url = new URL(str);
                if (url && url.pathname.startsWith("/settings/plus")) {
                    navigate(url.pathname + url.search);
                    return;
                }
            } catch (e) {
                // If it's not a URL, we'll just continue with normal parsing
            }

            const network = state.network || "signet";
            const result = await toParsedParams(str || "", network, sw);

            if (!result || !result.ok) {
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
        async refreshFederations() {
            const federations = await sw.list_federations();

            let expiration_warning:
                | {
                      expiresTimestamp: number;
                      expiresMessage: string;
                      federationName: string;
                  }
                | undefined = undefined;

            federations.forEach((f) => {
                if (f.popup_countdown_message && f.popup_end_timestamp) {
                    expiration_warning = {
                        expiresTimestamp: f.popup_end_timestamp,
                        expiresMessage: f.popup_countdown_message,
                        federationName: f.federation_name
                    };
                }
            });

            setState({ federations, expiration_warning });
        },
        cycleBalanceView() {
            if (state.balanceView === "sats") {
                localStorage.setItem("balanceView", "fiat");
                setState({ balanceView: "fiat" });
            } else if (state.balanceView === "fiat") {
                localStorage.setItem("balanceView", "hidden");
                setState({ balanceView: "hidden" });
            } else {
                localStorage.setItem("balanceView", "sats");
                setState({ balanceView: "sats" });
            }
        },
        async checkForExistingTab() {
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
        },
        // Only show the expiration warning once per session
        clearExpirationWarning() {
            setState({ expiration_warning_seen: true });
        },
        // Only show the shutdown warning once per session
        clearShutdownWarning() {
            setState({ shutdown_warning_seen: true });
        }
    };

    return [state, actions, sw] as const;
};

type MegaStoreContextType = ReturnType<typeof makeMegaStoreContext>;

export const MegaStoreContext = createContext<MegaStoreContextType>();
export const useMegaStore = () => useContext(MegaStoreContext)!;

export const Provider: ParentComponent = (props) => {
    const [state, actions, sw] = makeMegaStoreContext();

    onMount(async () => {
        const shouldSetup = await actions.preSetup();
        console.log("Should run setup?", shouldSetup);
        if (
            shouldSetup &&
            sw &&
            !state.existing_tab_detected &&
            !state.deleting &&
            !state.setup_error
        ) {
            await actions.setup();
        }
    });

    onCleanup(async () => {
        console.warn("Parent Component is being unmounted!!!");
        await sw.stop();
        console.warn("Successfully stopped mutiny wallet");
        sessionStorage.removeItem("MUTINY_WALLET_INITIALIZED");
    });

    return (
        <MegaStoreContext.Provider value={[state, actions, sw]}>
            {props.children}
        </MegaStoreContext.Provider>
    );
};
