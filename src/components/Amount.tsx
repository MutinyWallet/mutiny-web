import { Show } from "solid-js";
import { useMegaStore } from "~/state/megaStore";
import { satsToUsd } from "~/utils/conversions";

function prettyPrintAmount(n?: number | bigint): string {
    if (!n || n.valueOf() === 0) {
        return "0";
    }
    return n.toLocaleString();
}

export function Amount(props: {
    amountSats: bigint | number | undefined;
    showFiat?: boolean;
    loading?: boolean;
    centered?: boolean;
}) {
    const [state, _] = useMegaStore();

    const amountInUsd = () =>
        satsToUsd(state.price, Number(props.amountSats) || 0, true);

    return (
        <div
            class="flex flex-col gap-2"
            classList={{ "items-center": props.centered }}
        >
            <h1 class="text-4xl font-light">
                {props.loading ? "..." : prettyPrintAmount(props.amountSats)}
                &nbsp;
                <span class="text-xl">SATS</span>
            </h1>
            <Show when={props.showFiat}>
                <h2 class="text-xl font-light text-white/70">
                    &#8776; {props.loading ? "..." : amountInUsd()}&nbsp;
                    <span class="text-sm">USD</span>
                </h2>
            </Show>
        </div>
    );
}

export function AmountSmall(props: {
    amountSats: bigint | number | undefined;
}) {
    return (
        <span class="font-light">
            {prettyPrintAmount(props.amountSats)}&nbsp;
            <span class="text-sm">
                {props.amountSats === 1 || props.amountSats === 1n
                    ? "SAT"
                    : "SATS"}
            </span>
        </span>
    );
}
