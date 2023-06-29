import Reader from "~/components/Reader";
import { createEffect, createSignal } from "solid-js";
import { useNavigate } from "solid-start";
import { Button } from "~/components/layout";
import { PaymentParams } from "@mutinywallet/waila-wasm";
import { showToast } from "~/components/Toaster";
import { useMegaStore } from "~/state/megaStore";
import { Result } from "~/utils/typescript";

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

export default function Scanner() {
    const [state, actions] = useMegaStore();
    const [scanResult, setScanResult] = createSignal<string>();
    const navigate = useNavigate();

    function onResult(result: string) {
        setScanResult(result);
    }

    // TODO: is this correct? we always go back to where we came from when we scan... kind of like scan is a modal tbh
    function exit() {
        history.back();
    }

    async function handlePaste() {
        try {
            const text = await navigator.clipboard.readText();
            const trimText = text.trim();
            setScanResult(trimText);
        } catch (e) {
            console.error(e);
        }
    }

    // When we have a nice result we can head over to the send screen
    createEffect(() => {
        if (scanResult()) {
            const network = state.mutiny_wallet?.get_network() || "signet";
            const result = toParsedParams(scanResult() || "", network);
            if (!result.ok) {
                showToast(result.error);
                return;
            } else {
                if (
                    result.value?.address ||
                    result.value?.invoice ||
                    result.value?.node_pubkey ||
                    result.value?.lnurl
                ) {
                    actions.setScanResult(result.value);
                    navigate("/send");
                }
            }
        }
    });

    return (
        <div class="safe-top safe-left safe-right safe-bottom h-full">
            <Reader onResult={onResult} />
            <div class="w-full flex flex-col items-center fixed bottom-[2rem] gap-8 px-8">
                <div class="w-full max-w-[800px] flex flex-col gap-2">
                    <Button intent="blue" onClick={handlePaste}>
                        Paste Something
                    </Button>
                    <Button onClick={exit}>Cancel</Button>
                </div>
            </div>
        </div>
    );
}
