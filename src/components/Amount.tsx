import { Show } from "solid-js";
import { useMegaStore } from "~/state/megaStore";
import { satsToUsd } from "~/utils/conversions";
import bolt from "~/assets/icons/bolt.svg";
import chain from "~/assets/icons/chain.svg";

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
    icon?: "lightning" | "chain";
}) {
    const [state, _] = useMegaStore();

    const amountInUsd = () =>
        satsToUsd(state.price, Number(props.amountSats) || 0, true);

    return (
        <div
            class="flex flex-col gap-1"
            classList={{ "items-center": props.centered }}
        >
            <div class="flex gap-2 items-center">
                <Show when={props.icon === "lightning"}>
                    <img src={bolt} alt="lightning" class="h-[18px]" />
                </Show>
                <Show when={props.icon === "chain"}>
                    <img src={chain} alt="chain" class="h-[18px]" />
                </Show>
                <h1 class="text-2xl font-light">
                    {props.loading
                        ? "..."
                        : prettyPrintAmount(props.amountSats)}
                    &nbsp;
                    <span class="text-base font-light">SATS</span>
                </h1>
            </div>
            <Show when={props.showFiat}>
                <h2 class="text-sm font-light text-white/70">
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
