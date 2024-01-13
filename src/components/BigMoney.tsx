import { ArrowDownUp } from "lucide-solid";
import { Show } from "solid-js";

import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { Currency } from "~/utils";

function BigScalingText(props: {
    text: string;
    fiat?: Currency;
    mode: "fiat" | "sats";
    loading: boolean;
}) {
    const chars = () => props.text.length;
    const i18n = useI18n();

    return (
        <h1
            class="whitespace-nowrap px-2 text-center text-4xl font-light transition-transform duration-300 ease-out"
            classList={{
                "scale-90": chars() >= 11,
                "scale-95": chars() === 10,
                "scale-100": chars() === 9,
                "scale-105": chars() === 7,
                "scale-110": chars() === 6,
                "scale-125": chars() === 5,
                "scale-150": chars() <= 4
            }}
        >
            <Show when={!props.loading || props.mode === "sats"} fallback="…">
                {!props.loading && props.mode === "sats"}
                {props.mode === "fiat" &&
                    //adds only the symbol
                    props.fiat?.hasSymbol}
                {`${props.text} `}
                <span class="text-xl">
                    {props.fiat ? props.fiat.value : i18n.t("common.sats")}
                </span>
            </Show>
        </h1>
    );
}

function SmallSubtleAmount(props: {
    text: string;
    fiat?: Currency;
    mode: "fiat" | "sats";
    loading: boolean;
}) {
    const i18n = useI18n();

    return (
        <h2
            class="flex flex-row items-center whitespace-nowrap text-xl font-light text-neutral-400"
            tabIndex={0}
        >
            <Show when={!props.loading || props.mode === "fiat"} fallback="…">
                {props.fiat?.value !== "BTC" && props.mode === "sats" && "~"}
                {props.mode === "sats" &&
                    //adds only the symbol
                    props.fiat?.hasSymbol}
                {`${props.text} `}
                {/* IDK why a space doesn't work here */}
                <span class="flex-0 w-1">{""}</span>
                <span class="text-base">
                    {props.fiat ? props.fiat.value : i18n.t("common.sats")}
                </span>
                <ArrowDownUp class="flex-0 inline-block h-6 w-6 pl-2 hover:cursor-pointer" />
            </Show>
        </h2>
    );
}

export function BigMoney(props: {
    mode: "fiat" | "sats";
    displaySats: string;
    displayFiat: string;
    onToggle: () => void;
    inputFocused: boolean;
    onFocus: () => void;
}) {
    const [state, _actions] = useMegaStore();

    return (
        <div class="flex justify-center">
            <div class="flex w-max flex-col items-center justify-center p-4">
                <BigScalingText
                    text={
                        props.mode === "fiat"
                            ? props.displayFiat
                            : props.displaySats
                    }
                    fiat={props.mode === "fiat" ? state.fiat : undefined}
                    mode={props.mode}
                    loading={state.price === 0}
                />
                <div
                    class="mb-2 mt-4 h-[2px] w-full rounded-full"
                    classList={{
                        "bg-m-blue": props.inputFocused,
                        "bg-m-blue/0": !props.inputFocused
                    }}
                />
                <SmallSubtleAmount
                    text={
                        props.mode !== "fiat"
                            ? props.displayFiat
                            : props.displaySats
                    }
                    fiat={props.mode !== "fiat" ? state.fiat : undefined}
                    mode={props.mode}
                    loading={state.price === 0}
                />
            </div>
        </div>
    );
}
