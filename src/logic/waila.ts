import { PaymentParams } from "@mutinywallet/mutiny-wasm";

import { Result } from "~/utils";

export type ParsedParams = {
    original: string;
    address?: string;
    payjoin_enabled?: boolean;
    invoice?: string;
    amount_sats?: bigint;
    network?: string;
    memo?: string;
    privateTag?: string;
    node_pubkey?: string;
    lnurl?: string;
    lightning_address?: string;
    nostr_wallet_auth?: string;
    fedimint_invite?: string;
    is_lnurl_auth?: boolean;
    contact_id?: string;
};

export function toParsedParams(
    str: string,
    ourNetwork: string
): Result<ParsedParams> {
    let params;
    try {
        params = new PaymentParams(str || "");
    } catch (e) {
        return { ok: false, error: new Error("Invalid payment request") };
    }

    // If WAILA doesn't return a network we should default to our own
    // If the networks is testnet and we're on signet we should use signet
    const network = !params.network
        ? ourNetwork
        : params.network === "testnet" && ourNetwork === "signet"
          ? "signet"
          : params.network;

    if (network !== ourNetwork) {
        return {
            ok: false,
            error: new Error(
                `Destination is for ${params.network} but you're on ${ourNetwork}`
            )
        };
    }

    return {
        ok: true,
        value: {
            original: str,
            address: params.address,
            payjoin_enabled: params.payjoin_supported,
            invoice: params.invoice,
            amount_sats: params.amount_sats,
            network,
            memo: params.memo,
            node_pubkey: params.node_pubkey,
            lnurl: params.lnurl,
            lightning_address: params.lightning_address,
            nostr_wallet_auth: params.nostr_wallet_auth,
            is_lnurl_auth: params.is_lnurl_auth,
            fedimint_invite: params.fedimint_invite_code
        }
    };
}
