import { Capacitor } from "@capacitor/core";
import { Dialog } from "@kobalte/core";
import {
    createEffect,
    createResource,
    createSignal,
    For,
    Match,
    onCleanup,
    onMount,
    ParentComponent,
    Show,
    Switch
} from "solid-js";
import { useNavigate } from "solid-start";

import close from "~/assets/icons/close.svg";
import currencySwap from "~/assets/icons/currency-swap.svg";
import pencil from "~/assets/icons/pencil.svg";
import { Button, FeesModal, InfoBox, InlineAmount, VStack } from "~/components";
import { useI18n } from "~/i18n/context";
import { Network } from "~/logic/mutinyWalletSetup";
import { useMegaStore } from "~/state/megaStore";
import { DIALOG_CONTENT, DIALOG_POSITIONER } from "~/styles/dialogs";
import { fiatToSats, satsToFiat } from "~/utils";

import { Currency } from "./ChooseCurrency";

// Checks the users locale to determine if decimals should be a "." or a ","
const decimalDigitDivider = Number(1.0)
    .toLocaleString(navigator.languages[0], { minimumFractionDigits: 1 })
    .substring(1, 2);

function btcFloatRounding(localValue: string): string {
    return (
        (parseFloat(localValue) -
            parseFloat(localValue.charAt(localValue.length - 1)) / 100000000) /
        10
    ).toFixed(8);
}

function fiatInputSanitizer(input: string, maxDecimals: number): string {
    // Make sure only numbers and a single decimal point are allowed if decimals are allowed
    let allowDecimalRegex;
    if (maxDecimals !== 0) {
        allowDecimalRegex = new RegExp("[^0-9.]", "g");
    } else {
        allowDecimalRegex = new RegExp("[^0-9]", "g");
    }
    const numeric = input
        .replace(allowDecimalRegex, "")
        .replace(/(\..*)\./g, "$1");

    // Remove leading zeros if not a decimal, add 0 if starts with a decimal
    const cleaned = numeric.replace(/^0([^.]|$)/g, "$1").replace(/^\./g, "0.");

    // If there are more characters after the decimal than allowed, shift the decimal
    const shiftRegex = new RegExp(
        "(\\.[0-9]{" + (maxDecimals + 1) + "}).*",
        "g"
    );
    const shifted = cleaned.match(shiftRegex)
        ? (parseFloat(cleaned) * 10).toFixed(maxDecimals)
        : cleaned;

    // Truncate any numbers past the maxDecimal for the currency
    const decimalRegex = new RegExp("(\\.[0-9]{" + maxDecimals + "}).*", "g");
    const decimals = shifted.replace(decimalRegex, "$1");

    return decimals;
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
    fiat?: Currency;
}) {
    const i18n = useI18n();

    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    const holdThreshold = 500;

    function onHold() {
        if (
            props.character === "DEL" ||
            props.character === i18n.t("receive.amount_editable.del")
        ) {
            holdTimer = setTimeout(() => {
                props.onClear();
            }, holdThreshold);
        }
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
        // Skip the "." if it's sats or a fiat with no decimal option
        <Show
            when={
                (props.fiat &&
                    props.fiat?.maxFractionalDigits !== 0 &&
                    props.fiat?.value !== "BTC") ||
                !(props.character === "." || props.character === ",")
            }
            fallback={<div />}
        >
            <button
                class="font-semi font-inter flex items-center justify-center rounded-lg p-2 text-4xl text-white active:bg-m-blue disabled:opacity-50 md:hover:bg-white/10"
                onPointerDown={onHold}
                onPointerUp={endHold}
                onClick={onClick}
            >
                {props.character}
            </button>
        </Show>
    );
}

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
        <h2 class="flex flex-row items-end whitespace-nowrap text-xl font-light text-neutral-400">
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
                <img
                    class={"pb-[4px] pl-[4px] hover:cursor-pointer"}
                    src={currencySwap}
                    height={24}
                    width={24}
                    alt="Swap currencies"
                />
            </Show>
        </h2>
    );
}

function toDisplayHandleNaN(input: string, fiat?: Currency): string {
    const parsed = Number(input);

    //handle decimals so the user can always see the accurate amount
    if (isNaN(parsed)) {
        return "0";
    } else if (parsed === Math.trunc(parsed) && input.endsWith(".")) {
        return (
            parsed.toLocaleString(navigator.languages[0]) + decimalDigitDivider
        );
        /* To avoid having logic to handle every number up to 8 decimals 
        any custom currency pair that has more than 3 decimals will always show all decimals*/
    } else if (fiat?.maxFractionalDigits && fiat.maxFractionalDigits > 3) {
        return parsed.toLocaleString(navigator.languages[0], {
            minimumFractionDigits: parsed === 0 ? 0 : fiat.maxFractionalDigits,
            maximumFractionDigits: fiat.maxFractionalDigits
        });
    } else if (parsed === Math.trunc(parsed) && input.endsWith(".0")) {
        return parsed.toLocaleString(navigator.languages[0], {
            minimumFractionDigits: 1
        });
    } else if (parsed === Math.trunc(parsed) && input.endsWith(".00")) {
        return parsed.toLocaleString(navigator.languages[0], {
            minimumFractionDigits: 2
        });
    } else if (parsed === Math.trunc(parsed) && input.endsWith(".000")) {
        return parsed.toLocaleString(navigator.languages[0], {
            minimumFractionDigits: 3
        });
    } else if (
        parsed !== Math.trunc(parsed) &&
        // matches strings that have 3 total digits after the decimal and ends with 0
        input.match(/\.\d{2}0$/) &&
        input.includes(".", input.length - 4)
    ) {
        return parsed.toLocaleString(navigator.languages[0], {
            minimumFractionDigits: 3
        });
    } else if (
        parsed !== Math.trunc(parsed) &&
        // matches strings that have 2 total digits after the decimal and ends with 0
        input.match(/\.\d{1}0$/) &&
        input.includes(".", input.length - 3)
    ) {
        return parsed.toLocaleString(navigator.languages[0], {
            minimumFractionDigits: 2
        });
    } else {
        return parsed.toLocaleString(navigator.languages[0], {
            maximumFractionDigits: 3
        });
    }
}

export const AmountEditable: ParentComponent<{
    initialAmountSats: string;
    initialOpen: boolean;
    setAmountSats: (s: bigint) => void;
    showWarnings: boolean;
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
        satsToFiat(
            state.price,
            parseInt(props.initialAmountSats || "0") || 0,
            state.fiat
        )
    );

    const setSecondaryAmount = () =>
        mode() === "fiat"
            ? setLocalSats(
                  fiatToSats(
                      state.price,
                      parseFloat(localFiat() || "0") || 0,
                      false
                  )
              )
            : setLocalFiat(
                  satsToFiat(state.price, Number(localSats()) || 0, state.fiat)
              );

    /** FixedAmounts allows for the user to choose 3 amount options approximately equal to ~$1, ~$10, ~$100
     *  This is done by fetching the price and reducing it such that the amounts all end up around the same value
     *
     *  price = ~261,508.89
     *  roundedPrice = "261508"
     *  priceLength = 6
     *
     *  input - {@link multipler}: 1, 10, 100
     *  fixedAmount - (10 ** (6 - 5)) * {@link multiplier}
     *  result - 10, 100, 1000
     */

    const fixedAmount = (multiplier: number, label: boolean) => {
        const roundedPrice = Math.round(state.price);
        const priceLength = roundedPrice.toString().length;
        //This returns a stringified number based on the price range of the chosen currency as compared to BTC
        if (!label) {
            return Number(10 ** (priceLength - 5) * multiplier).toString();
            // Handle labels with a currency identifier inserted in front/back
        } else {
            return `${state.fiat?.hasSymbol ?? ""}${Number(
                10 ** (priceLength - 5) * multiplier
            ).toLocaleString(navigator.languages[0], {
                maximumFractionDigits: state.fiat.maxFractionalDigits
            })} ${!state.fiat?.hasSymbol ? state.fiat?.value : ""}`;
        }
    };

    const FIXED_AMOUNTS_SATS = [
        {
            label: i18n.t("receive.amount_editable.fix_amounts.ten_k"),
            amount: "10000"
        },
        {
            label: i18n.t("receive.amount_editable.fix_amounts.one_hundred_k"),
            amount: "100000"
        },
        {
            label: i18n.t("receive.amount_editable.fix_amounts.one_million"),
            amount: "1000000"
        }
    ];

    // Wait to set fiat amounts until we have a price when loading the page
    let FIXED_AMOUNTS_FIAT;

    createEffect(() => {
        if (state.price !== 0) {
            // set FIXED_AMOUNTS_FIAT once we have a price
            FIXED_AMOUNTS_FIAT = [
                {
                    label: fixedAmount(1, true),
                    amount: fixedAmount(1, false)
                },
                {
                    label: fixedAmount(10, true),
                    amount: fixedAmount(10, false)
                },
                {
                    label: fixedAmount(100, true),
                    amount: fixedAmount(100, false)
                }
            ];
            // Update secondary amount when price changes
            setSecondaryAmount();
        }
    });

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
        decimalDigitDivider,
        "0",
        i18n.t("receive.amount_editable.del")
    ];

    const displaySats = () => toDisplayHandleNaN(localSats());
    const displayFiat = () =>
        state.price !== 0 ? toDisplayHandleNaN(localFiat(), state.fiat) : "…";

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
                return i18n.t("receive.amount_editable.receive_too_small", {
                    amount: "100,000"
                });
            } else {
                return i18n.t("receive.amount_editable.receive_too_small", {
                    amount: "10,000"
                });
            }
        }

        const parsed = Number(localSats());
        if (isNaN(parsed)) {
            return undefined;
        }

        if (parsed > (inboundCapacity() || 0)) {
            return i18n.t("receive.amount_editable.setup_fee_lightning");
        }

        return undefined;
    };

    const betaWarning = () => {
        const parsed = Number(localSats());
        if (isNaN(parsed)) {
            return undefined;
        }

        if (parsed >= 2099999997690000) {
            // If over 21 million bitcoin, warn that too much
            return i18n.t("receive.amount_editable.more_than_21m");
        } else if (parsed >= 4000000) {
            // If over 4 million sats, warn that it's a beta bro
            return i18n.t("receive.amount_editable.too_big_for_beta");
        }
    };

    /** Handling character inputs gives our virtual keyboard full functionality to add and remove digits in a UX friendly way
     *  When the input is dealing with sats there is no allowed decimals
     *
     *  Special logic is required for BTC as we want to start from the 8th decimal
     *  if state.fiat.value === "BTC"
     *  input - 000123
     *  result - 0.00000123
     *
     *  input - 11"DEL"11
     *  result - 0.00000111
     *
     *  for other currencies the inputSanitizer seeks to limit the maximum decimal digits
     *
     *  if state.fiat.value === "KWD"
     *  input - 123.456666
     *  result - 123456.666
     */

    function handleCharacterInput(characterInput: string) {
        const isFiatMode = mode() === "fiat";
        const character = characterInput === "," ? "." : characterInput;
        let inputSanitizer;
        if (isFiatMode) {
            inputSanitizer = fiatInputSanitizer;
        } else {
            inputSanitizer = satsInputSanitizer;
        }
        const localValue = isFiatMode ? localFiat : localSats;

        let sane;

        if (
            character === "DEL" ||
            character === i18n.t("receive.amount_editable.del")
        ) {
            if (
                localValue().length === 1 ||
                (state.fiat.maxFractionalDigits === 0 &&
                    localValue().startsWith("0"))
            ) {
                sane = "0";
            } else if (
                state.fiat.value === "BTC" &&
                isFiatMode &&
                localValue() !== "0"
            ) {
                // This allows us to handle the backspace key and fight float rounding
                sane = inputSanitizer(
                    btcFloatRounding(localValue()),
                    state.fiat.maxFractionalDigits
                );
            } else {
                sane = inputSanitizer(
                    localValue().slice(0, -1),
                    state.fiat.maxFractionalDigits
                );
            }
        } else {
            if (localValue() === "0" && state.fiat.value !== "BTC") {
                sane = inputSanitizer(
                    character,
                    state.fiat.maxFractionalDigits
                );
            } else if (state.fiat.value === "BTC" && isFiatMode) {
                sane = inputSanitizer(
                    Number(localValue()).toFixed(8) + character,
                    state.fiat.maxFractionalDigits
                );
            } else {
                sane = inputSanitizer(
                    localValue() + character,
                    state.fiat.maxFractionalDigits
                );
            }
        }

        if (isFiatMode) {
            setLocalFiat(sane);
            setLocalSats(
                fiatToSats(state.price, parseFloat(sane || "0") || 0, false)
            );
        } else {
            setLocalSats(sane);
            setLocalFiat(
                satsToFiat(state.price, Number(sane) || 0, state.fiat)
            );
        }

        // After a button press make sure we re-focus the input
        focus();
    }

    function handleClear() {
        const isFiatMode = mode() === "fiat";

        if (isFiatMode) {
            setLocalFiat("0");
            setLocalSats(fiatToSats(state.price, parseFloat("0") || 0, false));
        } else {
            setLocalSats("0");
            setLocalFiat(satsToFiat(state.price, Number("0") || 0, state.fiat));
        }

        // After a button press make sure we re-focus the input
        focus();
    }

    function setFixedAmount(amount: string) {
        if (mode() === "fiat") {
            setLocalFiat(amount);
            setLocalSats(
                fiatToSats(state.price, parseFloat(amount || "0") || 0, false)
            );
        } else {
            setLocalSats(amount);
            setLocalFiat(
                satsToFiat(state.price, Number(amount) || 0, state.fiat)
            );
        }
    }

    function handleClose(e: SubmitEvent | MouseEvent | KeyboardEvent) {
        e.preventDefault();
        props.setAmountSats(BigInt(props.initialAmountSats));
        setIsOpen(false);
        setLocalSats(props.initialAmountSats);
        setLocalFiat(
            satsToFiat(
                state.price,
                parseInt(props.initialAmountSats || "0") || 0,
                state.fiat
            )
        );
        props.exitRoute && navigate(props.exitRoute);
        return false;
    }

    // What we're all here for in the first place: returning a value
    function handleSubmit(e: SubmitEvent | MouseEvent) {
        e.preventDefault();
        props.setAmountSats(BigInt(localSats()));
        setLocalFiat(
            satsToFiat(state.price, Number(localSats()) || 0, state.fiat)
        );
        setIsOpen(false);
        return false;
    }

    function handleSatsInput(e: InputEvent) {
        const { value } = e.target as HTMLInputElement;
        const sane = satsInputSanitizer(value);
        setLocalSats(sane);
        setLocalFiat(satsToFiat(state.price, Number(sane) || 0, state.fiat));
    }

    /** This behaves the same as handleCharacterInput but allows for the keyboard to be used instead of the virtual keypad
     *
     *  if state.fiat.value === "BTC"
     *  tracking e.data is required as the string is not created from just normal sequencing numbers
     *  input - 12345
     *  result - 0.00012345
     *
     *  if state.fiat.value !== "BTC"
     *  Otherwise we need to account for the user inputting decimals
     *  input - 123,45
     *  result - 123.45
     */

    function handleFiatInput(e: InputEvent) {
        const { value } = e.currentTarget as HTMLInputElement;
        let sane;

        if (state.fiat.value === "BTC") {
            if (e.data !== null) {
                sane = fiatInputSanitizer(
                    Number(localFiat()).toFixed(8) + e.data,
                    state.fiat.maxFractionalDigits
                );
            } else {
                sane = fiatInputSanitizer(
                    // This allows us to handle the backspace key and fight float rounding
                    btcFloatRounding(localFiat()),
                    state.fiat.maxFractionalDigits
                );
            }
        } else {
            sane = fiatInputSanitizer(
                value.replace(",", "."),
                state.fiat.maxFractionalDigits
            );
        }
        setLocalFiat(sane);
        setLocalSats(
            fiatToSats(state.price, parseFloat(sane || "0") || 0, false)
        );
    }

    function toggle(disabled: boolean) {
        if (!disabled) {
            setMode((m) => (m === "sats" ? "fiat" : "sats"));
        }
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
            ).toLocaleString(navigator.languages[0]);
        } else {
            return localSats();
        }
    };

    return (
        <Dialog.Root open={isOpen()}>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                class="flex items-center gap-2 rounded-xl border-2 border-m-blue px-4 py-2"
            >
                <Show
                    when={localSats() !== "0"}
                    fallback={
                        <div class="inline-block font-semibold">
                            {i18n.t("receive.amount_editable.set_amount")}
                        </div>
                    }
                >
                    <InlineAmount amount={maxOrLocalSats()} />
                </Show>
                <img src={pencil} alt="Edit" />
            </button>
            <Dialog.Portal>
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content
                        class={DIALOG_CONTENT}
                        // Should always be on top, even when nested in other dialogs
                        classList={{
                            "z-50": true,
                            // h-device works for android, h-[100dvh] works for ios
                            "h-device": Capacitor.getPlatform() === "android"
                        }}
                        onEscapeKeyDown={handleClose}
                    >
                        <div class="py-2" />

                        <div class="flex w-full justify-end">
                            <button
                                onClick={handleClose}
                                type="button"
                                class="h-8 w-8 rounded-lg hover:bg-white/10 active:bg-m-blue"
                            >
                                <img src={close} alt="Close" />
                            </button>
                        </div>
                        <form
                            onSubmit={handleSubmit}
                            class="absolute -z-10 opacity-0"
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

                        <div class="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-around gap-2">
                            <div class="flex justify-center">
                                <div
                                    class="flex w-max flex-col items-center justify-center gap-4 p-4"
                                    onClick={() => toggle(state.price === 0)}
                                >
                                    <BigScalingText
                                        text={
                                            mode() === "fiat"
                                                ? displayFiat()
                                                : displaySats()
                                        }
                                        fiat={
                                            mode() === "fiat"
                                                ? state.fiat
                                                : undefined
                                        }
                                        mode={mode()}
                                        loading={state.price === 0}
                                    />
                                    <SmallSubtleAmount
                                        text={
                                            mode() !== "fiat"
                                                ? displayFiat()
                                                : displaySats()
                                        }
                                        fiat={
                                            mode() !== "fiat"
                                                ? state.fiat
                                                : undefined
                                        }
                                        mode={mode()}
                                        loading={state.price === 0}
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
                                    when={warningText() && props.showWarnings}
                                >
                                    <InfoBox accent="blue">
                                        {warningText()} <FeesModal />
                                    </InfoBox>
                                </Match>
                            </Switch>
                            <div class="my-2 flex justify-center gap-4">
                                <For
                                    each={
                                        mode() === "fiat"
                                            ? FIXED_AMOUNTS_FIAT
                                            : FIXED_AMOUNTS_SATS
                                    }
                                >
                                    {(amount) => (
                                        <button
                                            onClick={() => {
                                                setFixedAmount(amount.amount);
                                                focus();
                                            }}
                                            class="rounded-lg bg-white/10 px-4 py-2"
                                        >
                                            {amount.label}
                                        </button>
                                    )}
                                </For>
                                <Show
                                    when={
                                        mode() === "sats" && props.maxAmountSats
                                    }
                                >
                                    <button
                                        onClick={() => {
                                            setFixedAmount(
                                                props.maxAmountSats!.toString()
                                            );
                                            focus();
                                        }}
                                        class="rounded-lg bg-white/10 px-4 py-2"
                                    >
                                        {i18n.t("receive.amount_editable.max")}
                                    </button>
                                </Show>
                            </div>
                            <div class="grid w-full flex-none grid-cols-3">
                                <For each={CHARACTERS}>
                                    {(character) => (
                                        <SingleDigitButton
                                            fiat={
                                                mode() === "fiat"
                                                    ? state.fiat
                                                    : undefined
                                            }
                                            character={character}
                                            onClick={handleCharacterInput}
                                            onClear={handleClear}
                                        />
                                    )}
                                </For>
                            </div>
                            <VStack>
                                <Button intent="green" onClick={handleSubmit}>
                                    {i18n.t(
                                        "receive.amount_editable.set_amount"
                                    )}
                                </Button>
                            </VStack>
                        </div>
                        <div class="py-2" />
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
