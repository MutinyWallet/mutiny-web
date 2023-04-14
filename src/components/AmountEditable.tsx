import { For, Show, createEffect, createMemo, createResource, createSignal } from 'solid-js';
import { Button } from '~/components/layout';
import { useMegaStore } from '~/state/megaStore';
import { satsToUsd } from '~/utils/conversions';
import { Amount } from './Amount';

const CHARACTERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];
const FULLSCREEN_STYLE = 'fixed top-0 left-0 w-screen h-screen z-50 bg-sidebar-gray p-4';

function SingleDigitButton(props: { character: string, onClick: (c: string) => void }) {
    return (
        <button
            class="p-2 rounded-lg hover:bg-white/10 active:bg-m-blue text-white text-4xl font-semi font-mono"
            onClick={() => props.onClick(props.character)}
        >
            {props.character}
        </button>
    );
}

export function AmountEditable(props: { amountSats: number | bigint, setAmountSats: (s: string) => void }) {
    const [isFullscreen, setIsFullscreen] = createSignal(false);

    function toggleFullscreen() {
        setIsFullscreen(!isFullscreen());
    }

    const [displayAmount, setDisplayAmount] = createSignal(props.amountSats.toString() || "0");

    let inputRef!: HTMLInputElement;

    function handleCharacterInput(character: string) {
        if (character === "⌫") {
            setDisplayAmount(displayAmount().slice(0, -1));
        } else {
            if (displayAmount() === "0") {
                setDisplayAmount(character);
            } else {
                setDisplayAmount(displayAmount() + character);
            }
        }

        // After a button press make sure we re-focus the input
        inputRef.focus()
    }

    createEffect(() => {
        if (isFullscreen()) {
            inputRef.focus();
        }
    })


    // making a "controlled" input is a known hard problem
    // https://github.com/solidjs/solid/discussions/416
    function handleHiddenInput(e: Event & {
        currentTarget: HTMLInputElement;
        target: HTMLInputElement;
    }) {
        // if the input is empty, set the display amount to 0
        if (e.target.value === "") {
            setDisplayAmount("0");
            return;
        }

        // if the input starts with one or more 0s, remove them, unless the input is just 0
        if (e.target.value.startsWith("0") && e.target.value !== "0") {
            setDisplayAmount(e.target.value.replace(/^0+/, ""));
            return;
        }

        // if there's already a decimal point, don't allow another one
        if (e.target.value.includes(".") && e.target.value.endsWith(".")) {
            setDisplayAmount(e.target.value.slice(0, -1));
            return;
        }

        setDisplayAmount(e.target.value);
    }

    // I tried to do this with cooler math but I think it gets confused between decimal and percent
    const scale = createMemo(() => {
        const chars = displayAmount().length;

        if (chars > 9) {
            return "scale-90"
        } else if (chars > 8) {
            return "scale-95"
        } else if (chars > 7) {
            return "scale-100"
        } else if (chars > 6) {
            return "scale-105"
        } else if (chars > 5) {
            return "scale-110"
        } else if (chars > 4) {
            return "scale-125"
        } else {
            return "scale-150"
        }
    })

    const prettyPrint = createMemo(() => {
        let parsed = Number(displayAmount());
        if (isNaN(parsed)) {
            return displayAmount();
        } else {
            return parsed.toLocaleString();
        }
    })

    // Fiat conversion
    const [state, _] = useMegaStore()

    async function getPrice() {
        return await state.node_manager?.get_bitcoin_price()
    }

    const [price] = createResource(getPrice)
    const amountInUsd = () => satsToUsd(price(), Number(displayAmount()) || 0, true)

    // What we're all here for in the first place: returning a value
    function handleSubmit() {
        // validate it's a number
        const number = Number(displayAmount());
        if (isNaN(number) || number < 0) {
            setDisplayAmount("0");
            inputRef.focus();
            return;
        } else {
            props.setAmountSats(displayAmount());
            toggleFullscreen();
        }
    }

    return (
        <>
            {/* TODO: a better transition than this */}
            <div class={`cursor-pointer transition-all ${isFullscreen() && FULLSCREEN_STYLE}`}>
                <Show when={isFullscreen()} fallback={<div class="p-4 rounded-xl border-2 border-m-blue" onClick={toggleFullscreen}>
                    <Amount amountSats={Number(displayAmount())} showFiat />
                </div>}>
                    <input ref={el => inputRef = el}
                        type="text"
                        class="opacity-0 absolute -z-10"
                        value={displayAmount()}
                        onInput={(e) => handleHiddenInput(e)}
                    />
                    <div class="w-full h-full max-w-[600px] mx-auto">
                        <div class="flex flex-col gap-4 h-full">
                            <div class="p-4 bg-black rounded-xl flex-1 flex flex-col gap-4 items-center justify-center">
                                <h1 class={`font-light text-center transition-transform ease-out duration-300 text-6xl ${scale()}`}>
                                    {prettyPrint()}&nbsp;<span class='text-xl'>SATS</span>
                                </h1>
                                <h2 class="text-xl font-light text-white/70" >
                                    &#8776; {amountInUsd()} <span class="text-sm">USD</span>
                                </h2>
                            </div>
                            <div class="grid grid-cols-3 w-full flex-none">
                                <For each={CHARACTERS}>
                                    {(character) => (
                                        <SingleDigitButton character={character} onClick={handleCharacterInput} />
                                    )}
                                </For>
                            </div>
                            <div class="flex-none">
                                <Button intent="inactive" class="w-full flex-none"
                                    onClick={handleSubmit}
                                >
                                    Set Amount
                                </Button>
                            </div>
                        </div>

                    </div>
                </Show>
            </div>
        </>
    );
}
