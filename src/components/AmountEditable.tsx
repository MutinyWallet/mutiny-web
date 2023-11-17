import {
    createEffect,
    createSignal,
    onCleanup,
    onMount,
    ParentComponent,
    Show
} from "solid-js";

import { AmountSmall, BigMoney } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import {
    btcFloatRounding,
    fiatInputSanitizer,
    fiatToSats,
    satsInputSanitizer,
    satsToFiat,
    toDisplayHandleNaN
} from "~/utils";

export const AmountEditable: ParentComponent<{
    initialAmountSats: string | bigint;
    setAmountSats: (s: bigint) => void;
    maxAmountSats?: bigint;
    fee?: string;
    frozenAmount?: boolean;
    onSubmit?: () => void;
}> = (props) => {
    const [state, _actions] = useMegaStore();
    const [mode, setMode] = createSignal<"fiat" | "sats">("sats");
    const i18n = useI18n();
    const [localSats, setLocalSats] = createSignal(
        props.initialAmountSats.toString() || "0"
    );
    const [localFiat, setLocalFiat] = createSignal(
        satsToFiat(
            state.price,
            parseInt(props.initialAmountSats.toString() || "0") || 0,
            state.fiat
        )
    );

    const displaySats = () => toDisplayHandleNaN(localSats());
    const displayFiat = () =>
        state.price !== 0 ? toDisplayHandleNaN(localFiat(), state.fiat) : "…";

    let satsInputRef!: HTMLInputElement;
    let fiatInputRef!: HTMLInputElement;

    createEffect(() => {
        if (focusState() === "focused") {
            props.setAmountSats(BigInt(localSats()));
        }
    });

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
            console.log("we're in the fiat branch");
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
    }

    onMount(() => {
        focus();
    });

    function focus() {
        // Make sure we actually have the inputs mounted before we try to focus them
        if (satsInputRef && fiatInputRef && !props.frozenAmount) {
            if (mode() === "sats") {
                satsInputRef.focus();
            } else {
                fiatInputRef.focus();
            }
        }
    }

    let divRef: HTMLDivElement;

    const [focusState, setFocusState] = createSignal<"focused" | "unfocused">(
        "focused"
    );

    const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        // If it was already active, we'll need to toggle
        if (focusState() === "unfocused") {
            focus();
            setFocusState("focused");
        } else {
            toggle(state.price === 0);
            focus();
        }
    };

    const handleClickOutside = (e: MouseEvent) => {
        if (e.target instanceof Element && !divRef.contains(e.target)) {
            setFocusState("unfocused");
        }
    };

    // When the keyboard on mobile is shown / hidden we should update our "focus" state
    // TODO: find a way so this doesn't fire on devices without a virtual keyboard
    function handleResize(e: Event) {
        const VIEWPORT_VS_CLIENT_HEIGHT_RATIO = 0.75;

        const target = e.target as VisualViewport;

        if (
            (target.height * target.scale) / window.screen.height <
            VIEWPORT_VS_CLIENT_HEIGHT_RATIO
        ) {
            console.log("keyboard is shown");
            setFocusState("focused");
        } else {
            console.log("keyboard is hidden");
            setFocusState("unfocused");
        }
    }

    onMount(() => {
        document.body.addEventListener("click", handleClickOutside);
        if ("visualViewport" in window) {
            window?.visualViewport?.addEventListener("resize", handleResize);
        }
    });

    onCleanup(() => {
        document.body.removeEventListener("click", handleClickOutside);
        if ("visualViewport" in window) {
            window?.visualViewport?.removeEventListener("resize", handleResize);
        }
    });

    return (
        <div class="mx-auto flex w-full max-w-[400px] flex-col items-center">
            <div ref={(el) => (divRef = el)} onMouseDown={handleMouseDown}>
                <form
                    class="absolute -z-10 opacity-0"
                    onSubmit={(e) => {
                        e.preventDefault();
                        props.onSubmit
                            ? props.onSubmit()
                            : setFocusState("unfocused");
                    }}
                >
                    <input type="submit" style={{ display: "none" }} />
                    <input
                        id="sats-input"
                        ref={(el) => (satsInputRef = el)}
                        disabled={mode() === "fiat" || props.frozenAmount}
                        autofocus={mode() === "sats"}
                        type="text"
                        value={localSats()}
                        onInput={handleSatsInput}
                        inputMode={"decimal"}
                        autocomplete="off"
                    />
                    <input
                        id="fiat-input"
                        ref={(el) => (fiatInputRef = el)}
                        disabled={mode() === "sats" || props.frozenAmount}
                        autofocus={mode() === "fiat"}
                        type="text"
                        value={localFiat()}
                        onInput={handleFiatInput}
                        inputMode={"decimal"}
                        autocomplete="off"
                    />
                </form>
                <BigMoney
                    mode={mode()}
                    displayFiat={displayFiat()}
                    displaySats={displaySats()}
                    onToggle={() => toggle(state.price === 0)}
                    inputFocused={
                        focusState() === "focused" && !props.frozenAmount
                    }
                    onFocus={() => focus()}
                />
            </div>
            <Show when={props.maxAmountSats}>
                <p class="flex gap-2 px-4 py-2 text-sm font-light text-m-grey-400 md:text-base">
                    {`${i18n.t("receive.amount_editable.balance")} `}
                    <AmountSmall amountSats={props.maxAmountSats!} />
                </p>
            </Show>
        </div>
    );
};
