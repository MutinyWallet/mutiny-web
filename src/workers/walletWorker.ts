import initMutinyWallet, {
    ActivityItem,
    BudgetPeriod,
    ChannelClosure,
    FederationBalance,
    FederationBalances,
    FedimintSweepResult,
    LnUrlParams,
    MutinyBalance,
    MutinyBip21RawMaterials,
    MutinyChannel,
    MutinyInvoice,
    MutinyPeer,
    MutinyWallet,
    NwcProfile,
    PaymentParams,
    PendingNwcInvoice,
    TagItem
} from "@mutinywallet/mutiny-wasm";

import { IActivityItem } from "~/components";
import { MutinyWalletSettingStrings } from "~/logic/mutinyWalletSetup";
import { FakeDirectMessage, OnChainTx } from "~/routes";
import {
    DiscoveredFederation,
    MutinyFederationIdentity
} from "~/routes/settings";

// For some reason {...invoice } doesn't bring across the paid field
function destructureInvoice(invoice: MutinyInvoice): MutinyInvoice {
    return {
        amount_sats: invoice.amount_sats,
        bolt11: invoice.bolt11,
        description: invoice.description,
        expire: invoice.expire,
        expired: invoice.expired,
        fees_paid: invoice.fees_paid,
        inbound: invoice.inbound,
        labels: invoice.labels,
        last_updated: invoice.last_updated,
        paid: invoice.paid,
        payee_pubkey: invoice.payee_pubkey,
        payment_hash: invoice.payment_hash,
        potential_hodl_invoice: invoice.potential_hodl_invoice,
        preimage: invoice.preimage,
        privacy_level: invoice.privacy_level,
        status: invoice.status
    } as MutinyInvoice;
}

let wallet: MutinyWallet | undefined;
export let wasm_initialized = false;
export let wallet_initialized = false;

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

export async function initializeWasm() {
    // Actually intialize the WASM, this should be the first thing that requires the WASM blob to be downloaded

    // If WASM is already initialized, don't init twice
    try {
        const _sats_the_standard = MutinyWallet.convert_btc_to_sats(1);
        console.debug("MutinyWallet WASM already initialized, skipping init");
        wasm_initialized = true;
        return;
    } catch (e) {
        console.debug("MutinyWallet WASM about to be initialized");
        await initMutinyWallet();
        console.debug("MutinyWallet WASM initialized");
    }
}

export async function setupMutinyWallet(
    settings: MutinyWalletSettingStrings,
    password?: string,
    safeMode?: boolean,
    shouldZapHodl?: boolean,
    nsec?: string
): Promise<boolean> {
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
        primal_api,
        blind_auth,
        hermes
    } = settings;

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
    console.log("Using blind auth", blind_auth);
    console.log("Using hermes", hermes);
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
        shouldUseLSPS ? undefined : lsp,
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
        // Nip7 (not supported in web worker)
        undefined,
        // primal URL
        primal_api || "https://primal-cache.mutinywallet.com/api",
        /// blind auth url
        blind_auth,
        /// hermes url
        hermes
    );

    wallet = mutinyWallet;
    wallet_initialized = true;

    return true;
}

/**
 * Gets the current balance of the wallet.
 * This includes both on-chain and lightning funds.
 *
 * This will not include any funds in an unconfirmed lightning channel.
 * @returns {Promise<MutinyBalance>}
 */
export async function get_balance(): Promise<MutinyBalance> {
    const balance = await wallet!.get_balance();
    return {
        federation: balance.federation,
        lightning: balance.lightning,
        confirmed: balance.confirmed,
        unconfirmed: balance.unconfirmed,
        force_close: balance.force_close
    } as MutinyBalance;
}

/**
 * Lists the federation id's of the federation clients in the manager.
 * @returns {Promise<any>}
 */
export async function list_federations(): Promise<MutinyFederationIdentity[]> {
    const federations = await wallet!.list_federations();
    return federations as MutinyFederationIdentity[];
}

/**
 * Checks whether or not the user is subscribed to Mutiny+.
 * Submits a NWC string to keep the subscription active if not expired.
 *
 * Returns None if there's no subscription at all.
 * Returns Some(u64) for their unix expiration timestamp, which may be in the
 * past or in the future, depending on whether or not it is currently active.
 * @returns {Promise<bigint | undefined>}
 */
export async function check_subscribed(): Promise<bigint | undefined> {
    const subscribed = await wallet!.check_subscribed();
    return subscribed;
}

/**
 * Stops all of the nodes and background processes.
 * Returns after node has been stopped.
 * @returns {Promise<void>}
 */
export async function stop(): Promise<void> {
    await wallet!.stop();
}

/**
 * Clears storage and deletes all data.
 *
 * All data in VSS persists but the device lock is cleared.
 * @returns {Promise<void>}
 */
export async function delete_all(): Promise<void> {
    await wallet!.delete_all();
}

/**
 * Gets the current bitcoin price in chosen Fiat.
 * @param {string | undefined} [fiat]
 * @returns {Promise<number>}
 */
export async function get_bitcoin_price(fiat: string): Promise<number> {
    const price = await wallet!.get_bitcoin_price(fiat);
    return price;
}

export async function get_tag_items(): Promise<TagItem[]> {
    const tagItems = await wallet!.get_tag_items();
    return tagItems;
}

/**
 * Returns the network of the wallet.
 * @returns {string}
 */
export async function get_network(): Promise<string> {
    const network = await wallet!.get_network();
    return network || "signet";
}

/**
 * Returns the user's nostr profile data
 * @returns {any}
 */
export async function get_nostr_profile(): Promise<NostrMetadata | undefined> {
    if (wallet) {
        const profile = wallet.get_nostr_profile();
        return { ...profile };
    } else {
        return undefined;
    }
}

/**
 * Returns all the on-chain and lightning activity from the wallet.
 * @param {number | undefined} [limit]
 * @param {number | undefined} [offset]
 */
export async function get_activity(
    limit: number,
    offset?: number
): Promise<IActivityItem[]> {
    const activity = await wallet!.get_activity(limit, offset);
    return activity;
}

export async function get_contact_for_npub(
    npub: string
): Promise<TagItem | undefined> {
    const contact = await wallet!.get_contact_for_npub(npub);
    if (!contact) return undefined;
    return { ...contact?.value };
}

export async function create_new_contact(
    name: string,
    npub?: string,
    ln_address?: string,
    lnurl?: string,
    image_url?: string
): Promise<string> {
    const contactId = await wallet!.create_new_contact(
        name,
        npub,
        ln_address,
        lnurl,
        image_url
    );
    return contactId;
}

export async function get_tag_item(id: string): Promise<TagItem | undefined> {
    const tagItem = await wallet!.get_tag_item(id);
    if (!tagItem) return undefined;
    return { ...tagItem?.value };
}

/**
 * Returns all the on-chain and lightning activity for a given label
 * @param {string} label
 * @returns {Promise<any>}
 */
export async function get_label_activity(
    label: string
): Promise<IActivityItem[]> {
    const activity = await wallet!.get_label_activity(label);
    return activity;
}

/**
 * Get dm conversation between us and given npub
 * Returns a vector of messages sorted by newest first
 * @param {string} npub
 * @param {bigint} limit
 * @param {bigint | undefined} [until]
 * @param {bigint | undefined} [since]
 * @returns {Promise<any>}
 */
export async function get_dm_conversation(
    npub: string,
    limit: bigint,
    until?: bigint,
    since?: bigint
): Promise<FakeDirectMessage[] | undefined> {
    const dms = await wallet!.get_dm_conversation(npub, limit, until, since);
    return [...dms];
}

/**
 * Gets an invoice from the node manager.
 * This includes sent and received invoices.
 * @param {string} invoice
 * @returns {Promise<MutinyInvoice>}
 */
export async function get_invoice(
    bolt11: string
): Promise<MutinyInvoice | undefined> {
    const invoice = await wallet!.get_invoice(bolt11);
    if (!invoice) return undefined;
    // For some reason {...invoice } doesn't bring across the paid field
    return destructureInvoice(invoice);
}

/**
 * Gets all contacts sorted by last used
 * @returns {Promise<any>}
 */
export async function get_contacts_sorted(): Promise<TagItem[] | undefined> {
    const contacts = await wallet!.get_contacts_sorted();
    return contacts;
}

export async function edit_contact(
    id: string,
    name: string,
    npub?: string,
    ln_address?: string,
    lnurl?: string,
    image_url?: string
): Promise<void> {
    await wallet!.edit_contact(id, name, npub, ln_address, lnurl, image_url);
}

export async function delete_contact(id: string): Promise<void> {
    await wallet!.delete_contact(id);
}

/**
 * Follows the npub on nostr if we're not already following
 * @param {string} npub
 * @returns {Promise<void>}
 */
export async function follow_npub(npub: string): Promise<void> {
    await wallet!.follow_npub(npub);
}

/**
 * Unfollows the npub on nostr if we're following them
 *
 * Returns true if we were following them before
 * @param {string} npub
 * @returns {Promise<void>}
 */
export async function unfollow_npub(npub: string): Promise<void> {
    await wallet!.unfollow_npub(npub);
}

/**
 * Sends a DM to the given npub
 * @param {string} npub
 * @param {string} message
 * @returns {Promise<string>}
 */
export async function send_dm(
    npub: string,
    message: string
): Promise<string | undefined> {
    const result = await wallet!.send_dm(npub, message);
    return result;
}

/**
 * Returns the user's npub
 * @returns {Promise<string>}
 */
export async function get_npub(): Promise<string | undefined> {
    const npub = await wallet!.get_npub();
    return npub;
}

/**
 * Decodes a lightning invoice into useful information.
 * Will return an error if the invoice is for a different network.
 * @param {string} invoice
 * @param {string | undefined} [network]
 * @returns {Promise<MutinyInvoice>}
 */
export async function decode_invoice(
    invoice: string,
    network?: string
): Promise<MutinyInvoice | undefined> {
    const decoded = await wallet!.decode_invoice(invoice, network);
    if (!decoded) return undefined;
    return destructureInvoice(decoded);
}

/**
 * Creates a BIP 21 invoice. This creates a new address and a lightning invoice.
 * The lightning invoice may return errors related to the LSP. Check the error and
 * fallback to `get_new_address` and warn the user that Lightning is not available.
 *
 *
 * Errors that might be returned include:
 *
 * - [`MutinyJsError::LspGenericError`]: This is returned for various reasons, including if a
 *   request to the LSP server fails for any reason, or if the server returns
 *   a status other than 500 that can't be parsed into a `ProposalResponse`.
 *
 * - [`MutinyJsError::LspFundingError`]: Returned if the LSP server returns an error with
 *   a status of 500, indicating an "Internal Server Error", and a message
 *   stating "Cannot fund new channel at this time". This means that the LSP cannot support
 *   a new channel at this time.
 *
 * - [`MutinyJsError::LspAmountTooHighError`]: Returned if the LSP server returns an error with
 *   a status of 500, indicating an "Internal Server Error", and a message stating "Invoice
 *   amount is too high". This means that the LSP cannot support the amount that the user
 *   requested. The user should request a smaller amount from the LSP.
 *
 * - [`MutinyJsError::LspConnectionError`]: Returned if the LSP server returns an error with
 *   a status of 500, indicating an "Internal Server Error", and a message that starts with
 *   "Failed to connect to peer". This means that the LSP is not connected to our node.
 *
 * If the server returns a status of 500 with a different error message,
 * a [`MutinyJsError::LspGenericError`] is returned.
 * @param {bigint | undefined} amount
 * @param {(string)[]} labels
 * @returns {Promise<MutinyBip21RawMaterials>}
 */
export async function create_bip21(
    amount: bigint | undefined,
    labels: string[]
): Promise<MutinyBip21RawMaterials> {
    const mbrw = await wallet!.create_bip21(amount, labels);
    return {
        ...mbrw?.value
    } as MutinyBip21RawMaterials;
}

/**
 * Creates a lightning invoice. The amount should be in satoshis.
 * If no amount is provided, the invoice will be created with no amount.
 * If no description is provided, the invoice will be created with no description.
 *
 * If the manager has more than one node it will create a phantom invoice.
 * If there is only one node it will create an invoice just for that node.
 * @param {bigint} amount
 * @param {(string)[]} labels
 * @returns {Promise<MutinyInvoice>}
 */
export async function create_invoice(
    amount: bigint,
    labels: string[]
): Promise<MutinyInvoice | undefined> {
    const invoice = await wallet!.create_invoice(amount, labels);
    if (!invoice) return undefined;
    return destructureInvoice(invoice);
}

/**
 * Estimates the onchain fee for a transaction sweep our on-chain balance
 * to the given address.
 *
 * The fee rate is in sat/vbyte.
 * @param {string} destination_address
 * @param {number | undefined} [fee_rate]
 * @returns {bigint}
 */
export async function estimate_sweep_tx_fee(
    address: string
): Promise<bigint | undefined> {
    const fee = await wallet!.estimate_sweep_tx_fee(address);
    return fee;
}

/**
 * Estimates the onchain fee for a transaction sending to the given address.
 * The amount is in satoshis and the fee rate is in sat/vbyte.
 * @param {string} destination_address
 * @param {bigint} amount
 * @param {number | undefined} [fee_rate]
 * @returns {bigint}
 */
export async function estimate_tx_fee(
    address: string,
    amount: bigint,
    feeRate?: number
): Promise<bigint | undefined> {
    const fee = await wallet!.estimate_tx_fee(address, amount, feeRate);
    return fee;
}
/**
 * Calls upon a LNURL to get the parameters for it.
 * This contains what kind of LNURL it is (pay, withdrawal, auth, etc).
 * @param {string} lnurl
 * @returns {Promise<LnUrlParams>}
 */
export async function decode_lnurl(lnurl: string): Promise<LnUrlParams> {
    const lnurlParams = await wallet!.decode_lnurl(lnurl);
    // PAIN: this is supposed to be returning bigints, but it returns numbers instead
    return {
        ...lnurlParams?.value
    } as LnUrlParams;
}

/**
 * Pays a lightning invoice from the selected node.
 * An amount should only be provided if the invoice does not have an amount.
 * The amount should be in satoshis.
 * @param {string} invoice_str
 * @param {bigint | undefined} amt_sats
 * @param {(string)[]} labels
 * @returns {Promise<MutinyInvoice>}
 */
export async function pay_invoice(
    invoice_str: string,
    amt_sats: bigint | undefined,
    labels: string[]
): Promise<MutinyInvoice | undefined> {
    const invoice = await wallet!.pay_invoice(invoice_str, amt_sats, labels);
    if (!invoice) return undefined;
    return destructureInvoice(invoice);
}

/**
 * Calls upon a LNURL and pays it.
 * This will fail if the LNURL is not a LNURL pay.
 * @param {string} lnurl
 * @param {bigint} amount_sats
 * @param {string | undefined} zap_npub
 * @param {(string)[]} labels
 * @param {string | undefined} [comment]
 * @param {string | undefined} [privacy_level]
 * @returns {Promise<MutinyInvoice>}
 */
export async function lnurl_pay(
    lnurl: string,
    amount_sats: bigint,
    zap_npub: string | undefined,
    labels: string[],
    comment?: string,
    privacy_level?: string
): Promise<MutinyInvoice | undefined> {
    const invoice = await wallet!.lnurl_pay(
        lnurl,
        amount_sats,
        zap_npub,
        labels,
        comment,
        privacy_level
    );
    if (!invoice) return undefined;
    return destructureInvoice(invoice);
}

/**
 * Sweeps all the funds from the wallet to the given address.
 * The fee rate is in sat/vbyte.
 *
 * If a fee rate is not provided, one will be used from the fee estimator.
 * @param {string} destination_address
 * @param {(string)[]} labels
 * @param {number | undefined} [fee_rate]
 * @returns {Promise<string>}
 */
export async function sweep_wallet(
    destination_address: string,
    labels: string[],
    fee_rate?: number
): Promise<string | undefined> {
    const payment = await wallet!.sweep_wallet(
        destination_address,
        labels,
        fee_rate
    );
    return payment;
}

export async function send_payjoin(
    payjoin_uri: string,
    amount: bigint,
    labels: string[],
    fee_rate?: number
): Promise<string | undefined> {
    const payment = await wallet!.send_payjoin(
        payjoin_uri,
        amount,
        labels,
        fee_rate
    );
    return payment;
}

/**
 * Sends an on-chain transaction to the given address.
 * The amount is in satoshis and the fee rate is in sat/vbyte.
 *
 * If a fee rate is not provided, one will be used from the fee estimator.
 * @param {string} destination_address
 * @param {bigint} amount
 * @param {(string)[]} labels
 * @param {number | undefined} [fee_rate]
 * @returns {Promise<string>}
 */
export async function send_to_address(
    destination_address: string,
    amount: bigint,
    labels: string[],
    fee_rate?: number
): Promise<string | undefined> {
    const payment = await wallet!.send_to_address(
        destination_address,
        amount,
        labels,
        fee_rate
    );
    return payment;
}

/**
 * Sends a spontaneous payment to a node from the selected node.
 * The amount should be in satoshis.
 * @param {string} to_node
 * @param {bigint} amt_sats
 * @param {string | undefined} message
 * @param {(string)[]} labels
 * @returns {Promise<MutinyInvoice>}
 */
export async function keysend(
    to_node: string,
    amt_sats: bigint,
    message: string | undefined,
    labels: string[]
): Promise<MutinyInvoice | undefined> {
    const invoice = await wallet!.keysend(to_node, amt_sats, message, labels);
    if (!invoice) return undefined;
    return destructureInvoice(invoice);
}

/**
 * Gets an invoice from the node manager.
 * This includes sent and received invoices.
 * @param {string} hash
 * @returns {Promise<MutinyInvoice>}
 */
export async function get_invoice_by_hash(
    hash: string
): Promise<MutinyInvoice> {
    const invoice = await wallet!.get_invoice_by_hash(hash);
    return destructureInvoice(invoice);
}

/**
 * Gets an channel closure from the node manager.
 * @param {string} user_channel_id
 * @returns {Promise<ChannelClosure>}
 */
export async function get_channel_closure(
    user_channel_id: string
): Promise<ChannelClosure> {
    const channel_closure = await wallet!.get_channel_closure(user_channel_id);
    return {
        channel_id: channel_closure.channel_id,
        node_id: channel_closure.node_id,
        reason: channel_closure.reason,
        timestamp: channel_closure.timestamp
    } as ChannelClosure;
}

/**
 * Gets the details of a specific on-chain transaction.
 * @param {string} txid
 * @returns {any}
 */
export async function get_transaction(txid: string): Promise<ActivityItem> {
    // TODO: this is an ActivityItem right?
    const transaction = await wallet!.get_transaction(txid);
    return transaction as ActivityItem;
}

/**
 * Gets a new bitcoin address from the wallet.
 * Will generate a new address on every call.
 *
 * It is recommended to create a new address for every transaction.
 * @param {(string)[]} labels
 * @returns {MutinyBip21RawMaterials}
 */
export async function get_new_address(
    labels: string[]
): Promise<MutinyBip21RawMaterials> {
    const mbrw = await wallet!.get_new_address(labels);
    return {
        ...mbrw?.value
    } as MutinyBip21RawMaterials;
}

/**
 * Checks if the given address has any transactions.
 * If it does, it returns the details of the first transaction.
 *
 * This should be used to check if a payment has been made to an address.
 * @param {string} address
 * @returns {Promise<any>}
 */
export async function check_address(address: string): Promise<OnChainTx> {
    const tx = await wallet!.check_address(address);
    return tx as OnChainTx;
}

/**
 * Lists all the channels for all the nodes in the node manager.
 * @returns {Promise<any>}
 */
export async function list_channels(): Promise<MutinyChannel[]> {
    const channels = await wallet!.list_channels();
    return channels;
}

/**
 * This should only be called when the user is setting up a new profile
 * never for an existing profile
 * @param {string | undefined} [name]
 * @param {string | undefined} [img_url]
 * @param {string | undefined} [lnurl]
 * @param {string | undefined} [nip05]
 * @returns {Promise<any>}
 */
export async function setup_new_profile(
    name?: string,
    img_url?: string,
    lnurl?: string,
    nip05?: string
): Promise<unknown> {
    const profile = await wallet!.setup_new_profile(
        name,
        img_url,
        lnurl,
        nip05
    );
    return profile;
}

/**
 * Queries our relays for federation announcements
 * @returns {Promise<any>}
 */
export async function discover_federations(): Promise<
    DiscoveredFederation[] | undefined
> {
    const federations = await wallet!.discover_federations();
    return federations;
}

/**
 * Checks if we have recommended the given federation
 * @param {string} federation_id
 * @returns {Promise<boolean>}
 */
export async function has_recommended_federation(
    federation_id: string
): Promise<boolean> {
    const hasRecommended =
        await wallet!.has_recommended_federation(federation_id);
    return hasRecommended;
}

/**
 * Adds a new federation based on its federation code
 * @param {string} federation_code
 * @returns {Promise<FederationIdentity>}
 */
export async function new_federation(inviteCode: string): Promise<unknown> {
    const newFederation = await wallet!.new_federation(inviteCode);
    return newFederation;
}

export type NostrMetadata = {
    name?: string;
    display_name?: string;
    picture?: string;
    lud16?: string;
    nip05?: string;
    deleted?: boolean;
};

/**
 * Sets the user's nostr profile data
 * @param {string | undefined} [name]
 * @param {string | undefined} [img_url]
 * @param {string | undefined} [lnurl]
 * @param {string | undefined} [nip05]
 * @returns {Promise<any>}
 */
export async function edit_nostr_profile(
    name?: string,
    img_url?: string,
    lnurl?: string,
    nip05?: string
): Promise<NostrMetadata> {
    const profile = await wallet!.edit_nostr_profile(
        name,
        img_url,
        lnurl,
        nip05
    );
    return {
        ...profile
    };
}

/**
 * Uploads a profile pic to nostr.build and returns the uploaded file's URL
 * @param {string} img_base64
 * @returns {Promise<string>}
 */
export async function upload_profile_pic(data: string): Promise<string> {
    const url = await wallet!.upload_profile_pic(data);
    return url;
}

/**
 * Lists all pending NWC invoices
 * @returns {(PendingNwcInvoice)[]}
 */
export async function get_pending_nwc_invoices(): Promise<
    PendingNwcInvoice[] | undefined
> {
    const pending = await wallet!.get_pending_nwc_invoices();

    // PAIN
    // Have to rebuild the array because it's an array of pointers
    const newPending: PendingNwcInvoice[] = [];
    for (const pendingItem of pending) {
        newPending.push({
            amount_sats: pendingItem.amount_sats,
            expiry: pendingItem.expiry,
            id: pendingItem.id,
            index: pendingItem.index,
            invoice: pendingItem.invoice,
            invoice_description: pendingItem.invoice_description,
            npub: pendingItem.npub,
            profile_name: pendingItem.profile_name
        } as PendingNwcInvoice);
    }
    return newPending;
}

/**
 * Deletes a nostr wallet connect profile
 * @param {number} profile_index
 * @returns {Promise<void>}
 */
export async function delete_nwc_profile(index: number): Promise<void> {
    await wallet!.delete_nwc_profile(index);
}

/**
 * Re-enables a disabled nwc profile
 * @param {number} index
 * @returns {Promise<void>}
 */
export async function enable_nwc_profile(index: number): Promise<void> {
    await wallet!.enable_nwc_profile(index);
}

/**
 * Get nostr wallet connect profiles
 * @returns {(NwcProfile)[]}
 */
export async function get_nwc_profiles(): Promise<NwcProfile[]> {
    const profiles = await wallet!.get_nwc_profiles();

    // PAIN
    // Have to rebuild the array because it's an array of pointers
    const newProfiles: NwcProfile[] = [];
    for (const profile of profiles) {
        newProfiles.push({
            ...profile.value
        } as NwcProfile);
    }
    return newProfiles;
}

/**
 * Approves a nostr wallet auth request.
 * Creates a new NWC profile and saves to storage.
 * This will also broadcast the info event to the relay.
 * @param {string} name
 * @param {string} uri
 * @param {bigint} budget
 * @param {BudgetPeriod} period
 * @returns {Promise<NwcProfile>}
 */
export async function approve_nostr_wallet_auth(
    name: string,
    uri: string
): Promise<NwcProfile> {
    const profile = await wallet!.approve_nostr_wallet_auth(name, uri);
    return profile;
}

/**
 * Finds a nostr wallet connect profile by index
 * @param {number} index
 * @returns {Promise<NwcProfile>}
 */
export async function get_nwc_profile(index: number): Promise<NwcProfile> {
    const profile = await wallet!.get_nwc_profile(index);
    console.log("get_nwc_profile", profile);
    return {
        ...profile.value
    } as NwcProfile;
}

/**
 * Approves an invoice and sends the payment
 * @param {string} hash
 * @returns {Promise<void>}
 */
export async function approve_invoice(hash: string): Promise<void> {
    await wallet!.approve_invoice(hash);
}

/**
 * Removes an invoice from the pending list, will also remove expired invoices
 * @param {string} hash
 * @returns {Promise<void>}
 */
export async function deny_invoice(hash: string): Promise<void> {
    await wallet!.deny_invoice(hash);
}

/**
 * Removes all invoices from the pending list
 * @returns {Promise<void>}
 */
export async function deny_all_pending_nwc(): Promise<void> {
    await wallet!.deny_all_pending_nwc();
}

/**
 * Set budget for a NWC Profile
 * @param {number} profile_index
 * @param {bigint} budget_sats
 * @param {BudgetPeriod} period
 * @param {bigint | undefined} [single_max_sats]
 * @returns {Promise<NwcProfile>}
 */
export async function set_nwc_profile_budget(
    profile_index: number,
    budget_sats: bigint,
    period: BudgetPeriod,
    single_max_sats?: bigint
): Promise<NwcProfile> {
    const profile = await wallet!.set_nwc_profile_budget(
        profile_index,
        budget_sats,
        period,
        single_max_sats
    );
    return profile;
}

/**
 * Require approval for a NWC Profile
 * @param {number} profile_index
 * @returns {Promise<NwcProfile>}
 */
export async function set_nwc_profile_require_approval(
    profile_index: number
): Promise<NwcProfile> {
    const profile =
        await wallet!.set_nwc_profile_require_approval(profile_index);
    return profile;
}

/**
 * Create a nostr wallet connect profile
 * @param {string} name
 * @param {(string)[] | undefined} [commands]
 * @returns {Promise<NwcProfile>}
 */
export async function create_nwc_profile(
    name: string,
    commands?: string[]
): Promise<NwcProfile> {
    const profile = await wallet!.create_nwc_profile(name, commands);
    return profile;
}

/**
 * Create a budgeted nostr wallet connect profile
 * @param {string} name
 * @param {bigint} budget
 * @param {BudgetPeriod} period
 * @param {bigint | undefined} [single_max]
 * @param {(string)[] | undefined} [commands]
 * @returns {Promise<NwcProfile>}
 */
export async function create_budget_nwc_profile(
    name: string,
    budget: bigint,
    period: BudgetPeriod,
    single_max?: bigint,
    commands?: string[]
): Promise<NwcProfile> {
    const profile = await wallet!.create_budget_nwc_profile(
        name,
        budget,
        period,
        single_max,
        commands
    );
    return profile;
}

/**
 * Disconnects from a peer from the selected node.
 * @param {string} peer
 * @returns {Promise<void>}
 */
export async function disconnect_peer(pubkey: string): Promise<void> {
    await wallet!.disconnect_peer(pubkey);
}

/**
 * Deletes a peer from the selected node.
 * This will make it so that the node will not attempt to
 * reconnect to the peer.
 * @param {string} peer
 * @returns {Promise<void>}
 */
export async function delete_peer(pubkey: string): Promise<void> {
    await wallet!.delete_peer(pubkey);
}

/**
 * Lists all the peers for all the nodes in the node manager.
 * @returns {Promise<any>}
 */
export async function list_peers(): Promise<MutinyPeer[]> {
    return wallet!.list_peers();
}

/**
 * Attempts to connect to a peer from the selected node.
 * @param {string} connection_string
 * @param {string | undefined} [label]
 * @returns {Promise<void>}
 */
export async function connect_to_peer(
    connection_string: string
): Promise<void> {
    await wallet!.connect_to_peer(connection_string);
}

/**
 * Closes a channel with the given outpoint.
 *
 * If force is true, the channel will be force closed.
 *
 * If abandon is true, the channel will be abandoned.
 * This will force close without broadcasting the latest transaction.
 * This should only be used if the channel will never actually be opened.
 *
 * If both force and abandon are true, an error will be returned.
 * @param {string} outpoint
 * @param {boolean} force
 * @param {boolean} abandon
 * @returns {Promise<void>}
 */
export async function close_channel(
    outpoint: string,
    force: boolean,
    abandon: boolean
): Promise<void> {
    await wallet!.close_channel(outpoint, force, abandon);
}

/**
 * Removes a federation by setting its archived status to true, based on the FederationId.
 * @param {string} federation_id
 * @returns {Promise<void>}
 */
export async function remove_federation(federation_id: string): Promise<void> {
    await wallet!.remove_federation(federation_id);
}

/**
 * Opens a channel from our selected node to the given pubkey.
 * The amount is in satoshis.
 *
 * The node must be online and have a connection to the peer.
 * The wallet much have enough funds to open the channel.
 * @param {string | undefined} to_pubkey
 * @param {bigint} amount
 * @param {number | undefined} [fee_rate]
 * @returns {Promise<MutinyChannel>}
 */
export async function open_channel(
    to_pubkey: string | undefined,
    amount: bigint
): Promise<MutinyChannel> {
    const channel = await wallet!.open_channel(to_pubkey, amount);
    return { ...channel.value } as MutinyChannel;
}

/**
 * Lists the pubkeys of the lightning node in the manager.
 * @returns {Promise<any>}
 */
export async function list_nodes(): Promise<string[]> {
    return await wallet!.list_nodes();
}

/**
 * Changes all the node's LSPs to the given config. If any of the nodes have an active channel with the
 * current LSP, it will fail to change the LSP.
 *
 * Requires a restart of the node manager to take effect.
 * @param {string | undefined} [lsp_url]
 * @param {string | undefined} [lsp_connection_string]
 * @param {string | undefined} [lsp_token]
 * @returns {Promise<void>}
 */
export async function change_lsp(
    lsp_url?: string,
    lsp_connection_string?: string,
    lsps_token?: string
): Promise<void> {
    await wallet!.change_lsp(lsp_url, lsp_connection_string, lsps_token);
}

/**
 * Resets BDK's keychain tracker. This will require a re-sync of the blockchain.
 *
 * This can be useful if you get stuck in a bad state.
 * @returns {Promise<void>}
 */
export async function reset_onchain_tracker(): Promise<void> {
    await wallet!.reset_onchain_tracker();
}

/**
 * Starts up all the nodes again.
 * Not needed after [NodeManager]'s `new()` function.
 * @returns {Promise<void>}
 */
export async function start(): Promise<void> {
    await wallet!.start();
}

/**
 * Authenticates with a LNURL-auth for the given profile.
 * @param {string} lnurl
 * @returns {Promise<void>}
 */
export async function lnurl_auth(lnurl: string): Promise<void> {
    // TODO: test auth
    await wallet!.lnurl_auth(lnurl);
}

type PlanDetails = {
    id: number;
    amount_sat: bigint;
};

/**
 * Gets the subscription plans for Mutiny+ subscriptions
 * @returns {Promise<any>}
 */
export async function get_subscription_plans(): Promise<PlanDetails[]> {
    return await wallet!.get_subscription_plans();
}

/**
 * Subscribes to a Mutiny+ plan with a specific plan id.
 *
 * Returns a lightning invoice so that the plan can be paid for to start it.
 * @param {number} id
 * @returns {Promise<MutinyInvoice>}
 */
export async function subscribe_to_plan(id: number): Promise<MutinyInvoice> {
    const invoice = await wallet!.subscribe_to_plan(id);
    return destructureInvoice(invoice);
}

/**
 * Pay the subscription invoice. This will post a NWC automatically afterwards.
 * @param {string} invoice_str
 * @param {boolean} autopay
 * @returns {Promise<void>}
 */
export async function pay_subscription_invoice(
    invoice_str: string,
    autopay: boolean
): Promise<void> {
    await wallet!.pay_subscription_invoice(invoice_str, autopay);
}

/**
 * Change our active nostr keys to the given nsec
 * @param {string | undefined} [nsec]
 * @param {string | undefined} [extension_pk]
 * @returns {Promise<string>}
 */
export async function change_nostr_keys(
    nsec?: string,
    extension_pk?: string
): Promise<string> {
    return await wallet!.change_nostr_keys(nsec, extension_pk);
}

/**
 * Sets the user's nostr profile data to a "deleted" state
 * @returns {Promise<any>}
 */
export async function delete_profile(): Promise<void> {
    await wallet!.delete_profile();
}

/**
 * Export the user's nostr secret key if available
 * @returns {Promise<string | undefined>}
 */
export async function export_nsec(): Promise<string | undefined> {
    // TODO: is this the right nsec?
    return await wallet!.export_nsec();
}

/**
 * Returns the mnemonic seed phrase for the wallet.
 * @returns {string}
 */
export async function show_seed(): Promise<string> {
    return await wallet!.show_seed();
}

/**
 * Create a single use nostr wallet connect profile
 * @param {bigint} amount_sats
 * @param {string} nwc_uri
 * @returns {Promise<string | undefined>}
 */
export async function claim_single_use_nwc(
    amount_sats: bigint,
    nwc_uri: string
): Promise<string | undefined> {
    return await wallet!.claim_single_use_nwc(amount_sats, nwc_uri);
}

/**
 * Calls upon a LNURL and withdraws from it.
 * This will fail if the LNURL is not a LNURL withdrawal.
 * @param {string} lnurl
 * @param {bigint} amount_sats
 * @returns {Promise<boolean>}
 */
export async function lnurl_withdraw(
    lnurl: string,
    amount_sats: bigint
): Promise<boolean> {
    return await wallet!.lnurl_withdraw(lnurl, amount_sats);
}

/**
 * Checks the registered username for the user
 * @returns {Promise<string | undefined>}
 */
export async function check_lnurl_name(): Promise<string | undefined> {
    return await wallet!.check_lnurl_name();
}

/**
 * Checks if a given LNURL name is available
 * @param {string} name
 * @returns {Promise<boolean>}
 */
export async function check_available_lnurl_name(
    name: string
): Promise<boolean> {
    return await wallet!.check_available_lnurl_name(name);
}

/**
 * Reserves a given LNURL name for the user
 * @param {string} name
 * @returns {Promise<void>}
 */
export async function reserve_lnurl_name(name: string): Promise<void> {
    return await wallet!.reserve_lnurl_name(name);
}

/**
 * Creates a recommendation event for a federation
 * @param {string} invite_code
 * @param {string | undefined} [review]
 * @returns {Promise<string>}
 */
export async function recommend_federation(
    invite_code: string,
    review?: string
): Promise<string> {
    return await wallet!.recommend_federation(invite_code, review);
}

/**
 * Creates a delete event for a federation recommendation
 * @param {string} federation_id
 * @returns {Promise<void>}
 */
export async function delete_federation_recommendation(
    federation_id: string
): Promise<void> {
    await wallet!.delete_federation_recommendation(federation_id);
}

/**
 * Gets the current balances of each federation.
 * @returns {Promise<FederationBalances>}
 */
export async function get_federation_balances(): Promise<FederationBalances> {
    const balances = await wallet!.get_federation_balances();
    if (!balances) return { balances: [] } as unknown as FederationBalances;
    // PAIN
    // Have to rebuild the balances from the raw data, which is a bit of a pain
    const newBalances: FederationBalance[] = [];
    for (const balance of balances.balances) {
        const newBalance: FederationBalance = {
            balance: balance.balance,
            identity_federation_id: balance.identity_federation_id,
            identity_uuid: balance.identity_uuid
        } as FederationBalance;
        newBalances.push(newBalance);
    }
    return {
        balances: newBalances
    } as FederationBalances;
}

export async function change_password(
    old_password?: string,
    new_password?: string
): Promise<void> {
    await wallet!.change_password(old_password, new_password);
}

/**
 * Converts a satoshi amount to BTC.
 * @param {bigint} sats
 * @returns {number}
 */
export async function convert_sats_to_btc(sats: bigint): Promise<number> {
    return await MutinyWallet.convert_sats_to_btc(sats);
}

/**
 * Converts a bitcoin amount in BTC to satoshis.
 * @param {number} btc
 * @returns {bigint}
 */
export async function convert_btc_to_sats(btc: number): Promise<bigint> {
    return await MutinyWallet.convert_btc_to_sats(btc);
}

/**
 * Returns if there is a saved wallet in storage.
 * This is checked by seeing if a mnemonic seed exists in storage.
 * @returns {Promise<boolean>}
 */
export async function has_node_manager(): Promise<boolean> {
    return await MutinyWallet.has_node_manager();
}

/**
 * Convert an npub string to a hex string
 * @param {string} npub
 * @returns {Promise<string>}
 */
export async function npub_to_hexpub(npub: string): Promise<string> {
    return await MutinyWallet.npub_to_hexpub(npub);
}

/**
 * Convert an npub string to a hex string
 * @param {string} nsec
 * @returns {Promise<string>}
 */
export async function nsec_to_npub(nsec: string): Promise<string> {
    return await MutinyWallet.nsec_to_npub(nsec);
}

/**
 * Convert an hex string to a npub string
 * @param {string} npub
 * @returns {Promise<string>}
 */
export async function hexpub_to_npub(hexpub: string): Promise<string> {
    // TODO: the argument is called "npub" but it's actually a hexpub?
    return await MutinyWallet.hexpub_to_npub(hexpub);
}

/**
 * Restore's the mnemonic after deleting the previous state.
 *
 * Backup the state beforehand. Does not restore lightning data.
 * Should refresh or restart afterwards. Wallet should be stopped.
 * @param {string} m
 * @param {string | undefined} [password]
 * @returns {Promise<void>}
 */
export async function restore_mnemonic(
    mnemonic: string,
    password?: string
): Promise<void> {
    await MutinyWallet.restore_mnemonic(mnemonic, password);
}

/**
 * Restore a node manager from a json object.
 * @param {string} json
 * @returns {Promise<void>}
 */
export async function import_json(json: string): Promise<void> {
    await MutinyWallet.import_json(json);
}

/**
 * Exports the current state of the node manager to a json object.
 * @param {string | undefined} [password]
 * @returns {Promise<string>}
 */
export async function export_json(password?: string): Promise<string> {
    return await MutinyWallet.export_json(password);
}

/**
 * Exports the current state of the node manager to a json object.
 * @returns {Promise<any>}
 */
export async function get_logs(): Promise<string[]> {
    return await MutinyWallet.get_logs();
}

/**
 * Returns the number of remaining seconds until the device lock expires.
 */
export async function get_device_lock_remaining_secs(
    password?: string,
    auth_url?: string,
    storage_url?: string
): Promise<bigint | undefined> {
    return await MutinyWallet.get_device_lock_remaining_secs(
        password,
        auth_url,
        storage_url
    );
}

/**
 * Opens a channel from our selected node to the given pubkey.
 * It will spend the all the on-chain utxo in full to fund the channel.
 *
 * The node must be online and have a connection to the peer.
 * @param {string | undefined} [to_pubkey]
 * @returns {Promise<MutinyChannel>}
 */
export async function sweep_all_to_channel(
    to_pubkey?: string
): Promise<MutinyChannel> {
    return await wallet!.sweep_all_to_channel(to_pubkey);
}

/**
 * Estimates the onchain fee for sweeping our on-chain balance to open a lightning channel.
 * The fee rate is in sat/vbyte.
 * @param {number | undefined} [fee_rate]
 * @returns {bigint}
 */
export async function estimate_sweep_channel_open_fee(
    fee_rate?: number | undefined
): Promise<bigint> {
    return await wallet!.estimate_sweep_channel_open_fee(fee_rate);
}

/**
 * Sweep the federation balance into a lightning channel
 * @param {bigint | undefined} [amount]
 * @returns {Promise<FedimintSweepResult>}
 */
export async function sweep_federation_balance(
    amount?: bigint,
    from_federation_id?: string,
    to_federation_id?: string
): Promise<FedimintSweepResult> {
    const result = await wallet!.sweep_federation_balance(
        amount,
        from_federation_id,
        to_federation_id
    );
    return { ...result.value } as FedimintSweepResult;
}

/**
 * Estimate the fee before trying to sweep from federation
 * @param {bigint | undefined} [amount]
 * @returns {Promise<bigint | undefined>}
 */
export async function estimate_sweep_federation_fee(
    amount?: bigint
): Promise<bigint | undefined> {
    return await wallet!.estimate_sweep_federation_fee(amount);
}

export async function parse_params(params: string): Promise<PaymentParams> {
    const paramsResult = await new PaymentParams(params);
    // PAIN just another object rebuild
    return {
        address: paramsResult.address,
        amount_msats: paramsResult.amount_msats,
        amount_sats: paramsResult.amount_sats,
        cashu_token: paramsResult.cashu_token,
        disable_output_substitution: paramsResult.disable_output_substitution,
        fedimint_invite_code: paramsResult.fedimint_invite_code,
        fedimint_oob_notes: paramsResult.fedimint_oob_notes,
        invoice: paramsResult.invoice,
        is_lnurl_auth: paramsResult.is_lnurl_auth,
        lightning_address: paramsResult.lightning_address,
        lnurl: paramsResult.lnurl,
        memo: paramsResult.memo,
        network: paramsResult.network,
        node_pubkey: paramsResult.node_pubkey,
        nostr_pubkey: paramsResult.nostr_pubkey,
        nostr_wallet_auth: paramsResult.nostr_wallet_auth,
        offer: paramsResult.offer,
        payjoin_endpoint: paramsResult.payjoin_endpoint,
        payjoin_supported: paramsResult.payjoin_supported,
        refund: paramsResult.refund,
        string: paramsResult.string
    } as PaymentParams;
}
