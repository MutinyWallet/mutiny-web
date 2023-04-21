import { For, createMemo, createSignal } from 'solid-js';
import { Button } from '~/components/layout';
import { useMegaStore } from '~/state/megaStore';
import { satsToUsd } from '~/utils/conversions';
import { Amount } from './Amount';
import { Dialog } from '@kobalte/core';

const CHARACTERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "DEL"];

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

export function AmountEditable(props: { initialAmountSats: string, setAmountSats: (s: bigint) => void, onSave?: () => void }) {
    const [displayAmount, setDisplayAmount] = createSignal(props.initialAmountSats || "0");

    let inputRef!: HTMLInputElement;

    function handleCharacterInput(character: string) {
        if (character === "DEL") {
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
        const parsed = Number(displayAmount());
        if (isNaN(parsed)) {
            return displayAmount();
        } else {
            return parsed.toLocaleString();
        }
    })

    // Fiat conversion
    const [state, _] = useMegaStore()

    const amountInUsd = () => satsToUsd(state.price, Number(displayAmount()) || 0, true)

    // What we're all here for in the first place: returning a value
    function handleSubmit() {
        // validate it's a number
        console.log("handling submit...");
        const number = Number(displayAmount());
        if (isNaN(number) || number < 0) {
            setDisplayAmount("0");
            inputRef.focus();
            return;
        } else {
            const bign = BigInt(displayAmount());
            props.setAmountSats(bign);
            // This is so the parent can focus the next input if it wants to
            if (props.onSave) {
                props.onSave();
            }
        }
    }

    const DIALOG_POSITIONER = "fixed inset-0 safe-top safe-bottom z-50"
    const DIALOG_CONTENT = "h-screen-safe p-4 bg-gray/50 backdrop-blur-md bg-black/80"

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <div class="p-4 rounded-xl border-2 border-m-blue">
                    <Amount amountSats={Number(displayAmount())} showFiat />
                </div>
            </Dialog.Trigger>
            <Dialog.Portal>
                {/* <Dialog.Overlay class={OVERLAY} /> */}
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT}>
                        {/* TODO: figure out how to submit on enter */}
                        <input ref={el => inputRef = el}
                            autofocus
                            inputmode='none'
                            type="text"
                            class="opacity-0 absolute -z-10"
                            value={displayAmount()}
                            onInput={(e) => handleHiddenInput(e)}
                        />
                        <div class="flex flex-col gap-4 max-w-[400px] mx-auto">
                            <div class="p-4 bg-black rounded-xl flex flex-col gap-4 items-center justify-center">
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
                            {/* TODO: this feels wrong */}
                            <Dialog.CloseButton>
                                <Button intent="inactive" class="w-full flex-none"
                                    onClick={handleSubmit}
                                >
                                    Set Amount
                                </Button>
                            </Dialog.CloseButton>
                        </div>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root >
    );
}
