import {
    For,
    ParentComponent,
    Show,
    createResource,
    createSignal,
    onMount,
    onCleanup,
    Switch,
    Match
} from "solid-js";
import { Button } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";
import { satsToUsd, usdToSats } from "~/utils/conversions";
import { Dialog } from "@kobalte/core";
import close from "~/assets/icons/close.svg";
import pencil from "~/assets/icons/pencil.svg";
import currencySwap from "~/assets/icons/currency-swap.svg";
import { InlineAmount } from "./AmountCard";
import { DIALOG_CONTENT, DIALOG_POSITIONER } from "~/styles/dialogs";
import { InfoBox } from "./InfoBox";
import { Network } from "~/logic/mutinyWalletSetup";
import { FeesModal } from "./MoreInfoModal";
import { useNavigate } from "@solidjs/router";
import { useI18n } from "~/i18n/context";

const CHARACTERS = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    ".",
    "0",
    "DEL"
];

const FIXED_AMOUNTS_SATS = [
    { label: "10k", amount: "10000" },
    { label: "100k", amount: "100000" },
    { label: "1m", amount: "1000000" }
];

const FIXED_AMOUNTS_USD = [
    { label: "$1", amount: "1" },
    { label: "$10", amount: "10" },
    { label: "$100", amount: "100" }
];

function fiatInputSanitizer(input: string): string {
    // Make sure only numbers and a single decimal point are allowed
    const numeric = input.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");

    // Remove leading zeros if not a decimal, add 0 if starts with a decimal
    const cleaned = numeric.replace(/^0([^.]|$)/g, "$1").replace(/^\./g, "0.");

    // If there are three characters after the decimal, shift the decimal
    const shifted = cleaned.match(/(\.[0-9]{3}).*/g)
        ? (parseFloat(cleaned) * 10).toFixed(2)
        : cleaned;

    // Truncate any numbers two past the decimal
    const twoDecimals = shifted.replace(/(\.[0-9]{2}).*/g, "$1");

    return twoDecimals;
}

function satsInputSanitizer(input: string): string {
    // Make sure only numbers are allowed
    const numeric = input.replace(/[^0-9]/g, "");
    // If it starts with a 0, remove the 0
    const noLeadingZero = numeric.replace(/^0([^.]|$)/g, "$1");

    return noLeadingZero;
}

function SingleDigitButton(props: {
    character: string;
    onClick: (c: string) => void;
    onClear: () => void;
    fiat: boolean;
}) {
    let holdTimer: number;
    const holdThreshold = 500;

    function onHold() {
        holdTimer = setTimeout(() => {
            props.onClear();
        }, holdThreshold);
    }

    function endHold() {
        clearTimeout(holdTimer);
    }

    function onClick() {
        props.onClick(props.character);

        clearTimeout(holdTimer);
    }

    onCleanup(() => {
        clearTimeout(holdTimer);
    });

    return (
        // Skip the "." if it's fiat
        <Show
            when={props.fiat || !(props.character === ".")}
            fallback={<div />}
        >
            <button
                class="disabled:opacity-50 flex justify-center items-center p-2 rounded-lg md:hover:bg-white/10 active:bg-m-blue text-white text-4xl font-semi font-inter"
                onMouseDown={onHold}
                onMouseUp={endHold}
                onMouseLeave={endHold}
                onClick={onClick}
            >
                {props.character}
            </button>
        </Show>
    );
}

function BigScalingText(props: { text: string; fiat: boolean }) {
    const chars = () => props.text.length;

    return (
        <h1
            class="font-light px-2 text-center transition-transform ease-out duration-300 text-4xl"
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
            {props.text}&nbsp;
            <span class="text-xl">{props.fiat ? "USD" : "SATS"}</span>
        </h1>
    );
}

function SmallSubtleAmount(props: { text: string; fiat: boolean }) {
    return (
        <h2 class="flex flex-row items-end text-xl font-light text-neutral-400">
            ~{props.text}&nbsp;
            <span class="text-base">{props.fiat ? "USD" : "SATS"}</span>
            <img
                class={"pl-[4px] pb-[4px] hover:cursor-pointer"}
                src={currencySwap}
                height={24}
                width={24}
                alt="Swap currencies"
            />
        </h2>
    );
}

function toDisplayHandleNaN(input: string, _fiat: boolean): string {
    const parsed = Number(input);

    //handle decimals so the user can always see the accurate amount
    if (isNaN(parsed)) {
        return "0";
    } else if (parsed === Math.trunc(parsed) && input.endsWith(".")) {
        return parsed.toLocaleString() + ".";
    } else if (parsed === Math.trunc(parsed) && input.endsWith(".0")) {
        return parsed.toFixed(1);
    } else if (parsed === Math.trunc(parsed) && input.endsWith(".00")) {
        return parsed.toFixed(2);
    } else if (
        parsed !== Math.trunc(parsed) &&
        input.endsWith("0") &&
        input.includes(".", input.length - 3)
    ) {
        return parsed.toFixed(2);
    } else {
        return parsed.toLocaleString();
    }
}

export const AmountEditable: ParentComponent<{
    initialAmountSats: string;
    initialOpen: boolean;
    setAmountSats: (s: bigint) => void;
    skipWarnings?: boolean;
    exitRoute?: string;
    maxAmountSats?: bigint;
    fee?: string;
}> = (props) => {
    const i18n = useI18n();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = createSignal(props.initialOpen);
    const [state, _actions] = useMegaStore();
    const [mode, setMode] = createSignal<"fiat" | "sats">("sats");
    const [localSats, setLocalSats] = createSignal(
        props.initialAmountSats || "0"
    );
    const [localFiat, setLocalFiat] = createSignal(
        satsToUsd(
            state.price,
            parseInt(props.initialAmountSats || "0") || 0,
            false
        )
    );

    const displaySats = () => toDisplayHandleNaN(localSats(), false);
    const displayFiat = () => `$${toDisplayHandleNaN(localFiat(), true)}`;

    let satsInputRef!: HTMLInputElement;
    let fiatInputRef!: HTMLInputElement;

    const [inboundCapacity] = createResource(async () => {
        try {
            const channels = await state.mutiny_wallet?.list_channels();
            let inbound = 0;

            for (const channel of channels) {
                inbound += channel.size - (channel.balance + channel.reserve);
            }

            return inbound;
        } catch (e) {
            console.error(e);
            return 0;
        }
    });

    const warningText = () => {
        if ((state.balance?.lightning || 0n) === 0n) {
            const network = state.mutiny_wallet?.get_network() as Network;
            if (network === "bitcoin") {
                return "Your first lightning receive needs to be 50,000 sats or greater. A setup fee will be deducted from the requested amount.";
            } else {
                return i18n.t("amount_editable_first_payment_10k_or_greater");
            }
        }

        const parsed = Number(localSats());
        if (isNaN(parsed)) {
            return undefined;
        }

        if (parsed > (inboundCapacity() || 0)) {
            return "A lightning setup fee will be charged if paid over lightning.";
        }

        return undefined;
    };

    const betaWarning = () => {
        const parsed = Number(localSats());
        if (isNaN(parsed)) {
            return undefined;
        }

        // If over 4 million sats, warn that it's a beta bro
        if (parsed >= 4000000) {
            return i18n.t("too_big_for_beta");
        }
    };

    function handleCharacterInput(character: string) {
        const isFiatMode = mode() === "fiat";
        const inputSanitizer = isFiatMode
            ? fiatInputSanitizer
            : satsInputSanitizer;
        const localValue = isFiatMode ? localFiat : localSats;

        let sane;

        if (character === "DEL") {
            if (localValue().length <= 1) {
                sane = "0";
            } else {
                sane = inputSanitizer(localValue().slice(0, -1));
            }
        } else {
            if (localValue() === "0") {
                sane = inputSanitizer(character);
            } else {
                sane = inputSanitizer(localValue() + character);
            }
        }

        if (isFiatMode) {
            setLocalFiat(sane);
            setLocalSats(
                usdToSats(state.price, parseFloat(sane || "0") || 0, false)
            );
        } else {
            setLocalSats(sane);
            setLocalFiat(satsToUsd(state.price, Number(sane) || 0, false));
        }

        // After a button press make sure we re-focus the input
        focus();
    }

    function handleClear() {
        const isFiatMode = mode() === "fiat";

        if (isFiatMode) {
            setLocalFiat("0");
            setLocalSats(usdToSats(state.price, parseFloat("0") || 0, false));
        } else {
            setLocalSats("0");
            setLocalFiat(satsToUsd(state.price, Number("0") || 0, false));
        }

        // After a button press make sure we re-focus the input
        focus();
    }

    function setFixedAmount(amount: string) {
        if (mode() === "fiat") {
            setLocalFiat(amount);
            setLocalSats(
                usdToSats(state.price, parseFloat(amount || "0") || 0, false)
            );
        } else {
            setLocalSats(amount);
            setLocalFiat(satsToUsd(state.price, Number(amount) || 0, false));
        }
    }

    function handleClose() {
        props.setAmountSats(BigInt(props.initialAmountSats));
        setIsOpen(false);
        setLocalSats(props.initialAmountSats);
        setLocalFiat(
            satsToUsd(
                state.price,
                parseInt(props.initialAmountSats || "0") || 0,
                false
            )
        );
        props.exitRoute && navigate(props.exitRoute);
    }

    // What we're all here for in the first place: returning a value
    function handleSubmit(e: SubmitEvent | MouseEvent) {
        e.preventDefault();
        props.setAmountSats(BigInt(localSats()));
        setLocalFiat(satsToUsd(state.price, Number(localSats()) || 0, false));
        setIsOpen(false);
    }

    function handleSatsInput(e: InputEvent) {
        const { value } = e.target as HTMLInputElement;
        const sane = satsInputSanitizer(value);
        setLocalSats(sane);
        setLocalFiat(satsToUsd(state.price, Number(sane) || 0, false));
    }

    function handleFiatInput(e: InputEvent) {
        const { value } = e.target as HTMLInputElement;
        const sane = fiatInputSanitizer(value);
        setLocalFiat(sane);
        setLocalSats(
            usdToSats(state.price, parseFloat(sane || "0") || 0, false)
        );
    }

    function toggle() {
        setMode((m) => (m === "sats" ? "fiat" : "sats"));
        focus();
    }

    onMount(() => {
        focus();
    });

    function focus() {
        // Make sure we actually have the inputs mounted before we try to focus them
        if (isOpen() && satsInputRef && fiatInputRef) {
            if (mode() === "sats") {
                satsInputRef.focus();
            } else {
                fiatInputRef.focus();
            }
        }
    }

    // If the user is trying to send the max amount we want to show max minus fee
    // Otherwise we just the actual amount they've entered
    const maxOrLocalSats = () => {
        if (
            props.maxAmountSats &&
            props.fee &&
            props.maxAmountSats === BigInt(localSats())
        ) {
            return (
                Number(props.maxAmountSats) - Number(props.fee)
            ).toLocaleString();
        } else {
            return localSats();
        }
    };

    return (
        <Dialog.Root open={isOpen()}>
            <button
                onClick={() => setIsOpen(true)}
                class="px-4 py-2 rounded-xl border-2 border-m-blue flex gap-2 items-center"
            >
                <Show
                    when={localSats() !== "0"}
                    fallback={
                        <div class="inline-block font-semibold">
                            {i18n.t("set_amount")}
                        </div>
                    }
                >
                    <InlineAmount amount={maxOrLocalSats()} />
                </Show>
                <img src={pencil} alt="Edit" />
                {/* {props.children} */}
            </button>
            <Dialog.Portal>
                {/* <Dialog.Overlay class={OVERLAY} /> */}
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content
                        class={DIALOG_CONTENT}
                        onEscapeKeyDown={handleClose}
                    >
                        {/* TODO: figure out how to submit on enter */}
                        <div class="w-full flex justify-end">
                            <button
                                onClick={handleClose}
                                class="hover:bg-white/10 rounded-lg active:bg-m-blue w-8 h-8"
                            >
                                <img src={close} alt="Close" />
                            </button>
                        </div>
                        {/* <form onSubmit={handleSubmit} class="text-black"> */}
                        <form
                            onSubmit={handleSubmit}
                            class="opacity-0 absolute -z-10"
                        >
                            <input
                                ref={(el) => (satsInputRef = el)}
                                disabled={mode() === "fiat"}
                                type="text"
                                value={localSats()}
                                onInput={handleSatsInput}
                                inputMode="none"
                            />
                            <input
                                ref={(el) => (fiatInputRef = el)}
                                disabled={mode() === "sats"}
                                type="text"
                                value={localFiat()}
                                onInput={handleFiatInput}
                                inputMode="none"
                            />
                        </form>

                        <div class="flex flex-col flex-1 justify-around gap-2 max-w-[400px] mx-auto w-full">
                            <div class="flex justify-center">
                                <div
                                    class="p-4 flex flex-col gap-4 w-max items-center justify-center"
                                    onClick={toggle}
                                >
                                    <BigScalingText
                                        text={
                                            mode() === "fiat"
                                                ? displayFiat()
                                                : displaySats()
                                        }
                                        fiat={mode() === "fiat"}
                                    />
                                    <SmallSubtleAmount
                                        text={
                                            mode() !== "fiat"
                                                ? displayFiat()
                                                : displaySats()
                                        }
                                        fiat={mode() !== "fiat"}
                                    />
                                </div>
                            </div>
                            <Switch>
                                <Match when={betaWarning()}>
                                    <InfoBox accent="red">
                                        {betaWarning()}
                                    </InfoBox>
                                </Match>
                                <Match
                                    when={warningText() && !props.skipWarnings}
                                >
                                    <InfoBox accent="blue">
                                        {warningText()} <FeesModal />
                                    </InfoBox>
                                </Match>
                            </Switch>
                            <div class="flex justify-center gap-4 my-2">
                                <For
                                    each={
                                        mode() === "fiat"
                                            ? FIXED_AMOUNTS_USD
                                            : FIXED_AMOUNTS_SATS
                                    }
                                >
                                    {(amount) => (
                                        <button
                                            onClick={() => {
                                                setFixedAmount(amount.amount);
                                                focus();
                                            }}
                                            class="py-2 px-4 rounded-lg bg-white/10"
                                        >
                                            {amount.label}
                                        </button>
                                    )}
                                </For>
                                <Show when={props.maxAmountSats}>
                                    <button
                                        onClick={() => {
                                            setFixedAmount(
                                                props.maxAmountSats!.toString()
                                            );
                                            focus();
                                        }}
                                        class="py-2 px-4 rounded-lg bg-white/10"
                                    >
                                        MAX
                                    </button>
                                </Show>
                            </div>
                            <div class="grid grid-cols-3 w-full flex-none">
                                <For each={CHARACTERS}>
                                    {(character) => (
                                        <SingleDigitButton
                                            fiat={mode() === "fiat"}
                                            character={character}
                                            onClick={handleCharacterInput}
                                            onClear={handleClear}
                                        />
                                    )}
                                </For>
                            </div>
                            <Button
                                intent="green"
                                class="w-full flex-none"
                                onClick={handleSubmit}
                            >
                                {i18n.t("set_amount")}
                            </Button>
                        </div>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
