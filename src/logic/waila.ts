import initWaila, { PaymentParams } from "@mutinywallet/waila-wasm";
import { Result } from "~/utils/typescript";

// Make sure we've initialzied waila before we try to use it
await initWaila();

export type ParsedParams = {
    address?: string;
    invoice?: string;
    amount_sats?: bigint;
    network?: string;
    memo?: string;
    node_pubkey?: string;
    lnurl?: string;
};

export function toParsedParams(
    str: string,
    ourNetwork: string
): Result<ParsedParams> {
    let params;
    try {
        params = new PaymentParams(str || "");
    } catch (e) {
        console.error(e);
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
            address: params.address,
            invoice: params.invoice,
            amount_sats: params.amount_sats,
            network,
            memo: params.memo,
            node_pubkey: params.node_pubkey,
            lnurl: params.lnurl
        }
    };
}
