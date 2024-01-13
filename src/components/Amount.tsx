import { Link, Users, Zap } from "lucide-solid";
import { Show } from "solid-js";

import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { satsToFormattedFiat } from "~/utils";

function prettyPrintAmount(n?: number | bigint): string {
    if (!n || n.valueOf() === 0) {
        return "0";
    }
    return n.toLocaleString(navigator.languages[0]);
}

export function AmountSats(props: {
    amountSats: bigint | number | undefined;
    icon?: "lightning" | "community" | "chain" | "plus" | "minus";
    denominationSize?: "sm" | "lg" | "xl";
    isFederation?: boolean;
}) {
    const i18n = useI18n();
    return (
        <div class="flex items-center gap-2">
            <Show when={props.icon === "lightning"}>
                <Zap class="w-[18px]" />
            </Show>
            <Show when={props.icon === "community"}>
                <Users class="w-[18px]" />
            </Show>
            <Show when={props.icon === "chain"}>
                <Link class="w-[18px]" />
            </Show>
            <h1 class="whitespace-nowrap text-right font-light">
                <Show when={props.icon === "plus"}>
                    <span>+</span>
                </Show>
                <Show when={props.icon === "minus"}>
                    <span>-</span>
                </Show>
                {`${prettyPrintAmount(props.amountSats)} `}
                <span
                    class="text-base font-light"
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
                        {props.isFederation
                            ? i18n.t("common.e_sats")
                            : i18n.t("common.sats")}
                    </Show>
                    <Show
                        when={
                            props.amountSats && Number(props.amountSats) === 1
                        }
                    >
                        {props.isFederation
                            ? i18n.t("common.e_sat")
                            : i18n.t("common.sat")}
                    </Show>
                </span>
            </h1>
        </div>
    );
}

export function AmountFiat(props: {
    amountSats: bigint | number | undefined;
    denominationSize?: "sm" | "lg" | "xl";
}) {
    const [state, _] = useMegaStore();

    const amountInFiat = () =>
        (state.fiat.value === "BTC" ? "" : "~") +
        satsToFormattedFiat(
            state.price,
            Number(props.amountSats) || 0,
            state.fiat
        );

    return (
        <h2 class="whitespace-nowrap font-light">
            {amountInFiat()}
            <span
                classList={{
                    "text-sm": props.denominationSize === "sm",
                    "text-lg": props.denominationSize === "lg",
                    "text-xl": props.denominationSize === "xl"
                }}
            >
                {` ${state.fiat.value} `}
            </span>
        </h2>
    );
}

export function AmountSmall(props: {
    amountSats: bigint | number | undefined;
}) {
    const i18n = useI18n();
    return (
        <span class="whitespace-nowrap text-sm font-light md:text-base">
            {`${prettyPrintAmount(props.amountSats)} `}
            <span class="text-xs md:text-sm">
                {props.amountSats === 1 || props.amountSats === 1n
                    ? i18n.t("common.sat")
                    : i18n.t("common.sats")}
            </span>
        </span>
    );
}
