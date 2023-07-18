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
    whiteBg?: boolean;
    align?: "left" | "center" | "right";
    icon?: "lightning" | "chain" | "plus" | "minus";
    size?: "small" | "large" | "xl";
    green?: boolean;
}) {
    const [state, _] = useMegaStore();

    const amountInUsd = () =>
        satsToUsd(state.price, Number(props.amountSats) || 0, true);

    return (
        <div
            class="flex flex-col gap-1"
            classList={{
                "items-start": props.align === "left",
                "items-center": props.align === "center",
                "items-end": props.align === "right"
            }}
        >
            <div class="flex gap-2 items-center">
                <Show when={props.icon === "lightning"}>
                    <img src={bolt} alt="lightning" class="h-[18px]" />
                </Show>
                <Show when={props.icon === "chain"}>
                    <img src={chain} alt="chain" class="h-[18px]" />
                </Show>
                <h1
                    class="font-light text-right"
                    classList={{
                        "text-black": props.whiteBg,
                        "text-sm": props.size === "small",
                        "text-xl": props.size === "large",
                        "text-2xl": props.size === "xl",
                        "text-m-green": props.green
                    }}
                >
                    <Show when={props.icon === "plus"}>
                        <span>+</span>
                    </Show>
                    <Show when={props.icon === "minus"}>
                        <span>-</span>
                    </Show>
                    {props.loading
                        ? "..."
                        : prettyPrintAmount(props.amountSats)}
                    &nbsp;
                    <span
                        class="font-light text-base"
                        classList={{
                            "text-sm": props.size === "small",
                            "text-lg": props.size === "xl"
                        }}
                    >
                        <Show
                            when={
                                !props.amountSats ||
                                Number(props.amountSats) > 1 ||
                                Number(props.amountSats) === 0
                            }
                        >
                            SATS
                        </Show>
                        <Show
                            when={
                                props.amountSats &&
                                Number(props.amountSats) === 1
                            }
                        >
                            SAT
                        </Show>
                    </span>
                </h1>
            </div>
            <Show when={props.showFiat}>
                <h2
                    class="font-light text-white/70"
                    classList={{
                        "text-black": props.whiteBg,
                        "text-white/70": !props.whiteBg,
                        "text-sm": !props.size,
                        "text-xs": props.size === "small",
                        "text-base": props.size === "large",
                        "text-lg": props.size === "xl"
                    }}
                >
                    ~
                    <Show when={props.size === "xl"}>
                        <span>&nbsp;</span>
                    </Show>
                    {props.loading ? "..." : amountInUsd()}
                    <span
                        class="text-sm"
                        classList={{
                            "text-xs": props.size === "small",
                            "text-base": props.size === "large"
                        }}
                    >
                        &nbsp;USD
                    </span>
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
