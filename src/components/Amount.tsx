import { Show } from "solid-js";
import { useMegaStore } from "~/state/megaStore";
import { satsToUsd } from "~/utils/conversions";
import bolt from "~/assets/icons/bolt.svg";
import chain from "~/assets/icons/chain.svg";
import { useI18n } from "~/i18n/context";

function prettyPrintAmount(n?: number | bigint): string {
    if (!n || n.valueOf() === 0) {
        return "0";
    }
    return n.toLocaleString();
}

export function AmountSats(props: {
    amountSats: bigint | number | undefined;
    loading?: boolean;
    icon?: "lightning" | "chain" | "plus" | "minus";
    denominationSize?: "sm" | "lg" | "xl";
}) {
    const i18n = useI18n();
    return (
        <div class="flex gap-2 items-center">
            <Show when={props.icon === "lightning"}>
                <img src={bolt} alt="lightning" class="h-[18px]" />
            </Show>
            <Show when={props.icon === "chain"}>
                <img src={chain} alt="chain" class="h-[18px]" />
            </Show>
            <h1 class="font-light text-right">
                <Show when={props.icon === "plus"}>
                    <span>+</span>
                </Show>
                <Show when={props.icon === "minus"}>
                    <span>-</span>
                </Show>
                {props.loading ? "..." : prettyPrintAmount(props.amountSats)}
                &nbsp;
                <span
                    class="font-light text-base"
                    classList={{
                        "text-sm": props.denominationSize === "sm",
                        "text-lg": props.denominationSize === "lg",
                        "text-xl": props.denominationSize === "xl"
                    }}
                >
                    <Show
                        when={
                            !props.amountSats ||
                            Number(props.amountSats) > 1 ||
                            Number(props.amountSats) === 0
                        }
                    >
                        {i18n.t("common.sats")}
                    </Show>
                    <Show
                        when={
                            props.amountSats && Number(props.amountSats) === 1
                        }
                    >
                        {i18n.t("common.sat")}
                    </Show>
                </span>
            </h1>
        </div>
    );
}

export function AmountFiat(props: {
    amountSats: bigint | number | undefined;
    loading?: boolean;
    denominationSize?: "sm" | "lg" | "xl";
}) {
    const i18n = useI18n();
    const [state, _] = useMegaStore();

    const amountInUsd = () =>
        satsToUsd(state.price, Number(props.amountSats) || 0, true);

    return (
        <h2 class="font-light">
            ~{props.loading ? "..." : amountInUsd()}
            <span
                classList={{
                    "text-sm": props.denominationSize === "sm",
                    "text-lg": props.denominationSize === "lg",
                    "text-xl": props.denominationSize === "xl"
                }}
            >
                &nbsp;{i18n.t("common.usd")}
            </span>
        </h2>
    );
}

export function AmountSmall(props: {
    amountSats: bigint | number | undefined;
}) {
    const i18n = useI18n();
    return (
        <span class="font-light">
            {prettyPrintAmount(props.amountSats)}&nbsp;
            <span class="text-sm">
                {props.amountSats === 1 || props.amountSats === 1n
                    ? i18n.t("common.sat")
                    : i18n.t("common.sats")}
            </span>
        </span>
    );
}
