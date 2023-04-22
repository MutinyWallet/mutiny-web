import Reader from "~/components/Reader";
import { createEffect, createSignal, onMount, Show } from "solid-js";
import { useNavigate } from "solid-start";
import { Button } from "~/components/layout";
import init, { PaymentParams } from "@mutinywallet/waila-wasm";
import { showToast } from "~/components/Toaster";
import { useMegaStore } from "~/state/megaStore";
import { Result } from "~/utils/typescript";

export type ParsedParams = {
    address?: string;
    invoice?: string;
    amount_sats?: bigint;
    network?: string;
    memo?: string;
}

export function toParsedParams(str: string, ourNetwork: string): Result<ParsedParams> {
    const params = new PaymentParams(str || "")

    console.log("params network:", params.network)
    console.log("our network:", ourNetwork)

    // TODO: "testnet" and "signet" are encoded the same I guess?
    if (params.network === "testnet" || params.network === "signet") {
        if (ourNetwork === "signet") {
            // noop
        }
    } else if (params.network !== ourNetwork) {
        return { ok: false, error: new Error(`Destination is for ${params.network} but you're on ${ourNetwork}`) }
    }

    return {
        ok: true, value: {
            address: params.address,
            invoice: params.invoice,
            amount_sats: params.amount_sats,
            network: params.network,
            memo: params.memo
        }
    }
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

    function handlePaste() {
        navigator.clipboard.readText().then(text => {
            setScanResult(text);
        });
    }

    let waila;

    onMount(() => {
        init().then((w) => {
            waila = w;
        });
    })

    // When we have a nice result we can head over to the send screen
    createEffect(() => {
        if (scanResult()) {
            const network = state.node_manager?.get_network() || "signet";
            const result = toParsedParams(scanResult() || "", network);
            if (!result.ok) {
                showToast(result.error);
                return;
            } else {
                if (result.value?.address || result.value?.invoice) {
                    actions.setScanResult(result.value);
                    navigate("/send")
                }
            }
        }
    })

    return (
        <div class="safe-top safe-left safe-right safe-bottom h-screen-safe">
            <Reader onResult={onResult} />
            <div class="w-full flex flex-col items-center fixed bottom-[2rem] gap-8 px-8">
                <div class="w-full max-w-[800px] flex flex-col gap-2">
                    <Button intent="blue" onClick={handlePaste}>Paste Something</Button>
                    <Button onClick={exit}>Cancel</Button>
                </div>
            </div>
        </div>
    );
}