import { For, ParentComponent, Show, createMemo, createResource, createSignal } from "solid-js";
import { Button } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";
import { satsToUsd } from "~/utils/conversions";
import { Dialog } from "@kobalte/core";
import close from "~/assets/icons/close.svg";
import pencil from "~/assets/icons/pencil.svg";
import { InlineAmount } from "./AmountCard";
import { DIALOG_CONTENT, DIALOG_POSITIONER } from "~/styles/dialogs";
import { InfoBox } from "./InfoBox";
import { Network } from "~/logic/mutinyWalletSetup";

const CHARACTERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "DEL"];

const FIXED_AMOUNTS = [
  { label: "10k", amount: "10000" },
  { label: "100k", amount: "100000" },
  { label: "1m", amount: "1000000" }
];

function SingleDigitButton(props: {
  character: string;
  onClick: (c: string) => void;
  fiat: boolean;
}) {
  return (
    // Skip the "." if it's fiat
    <Show when={props.fiat || !(props.character === ".")} fallback={<div />}>
      <button
        disabled={props.character === "."}
        class="disabled:opacity-50 p-2 rounded-lg md:hover:bg-white/10 active:bg-m-blue text-white text-4xl font-semi font-mono"
        onClick={() => props.onClick(props.character)}
      >
        {props.character}
      </button>
    </Show>
  );
}

export const AmountEditable: ParentComponent<{
  initialAmountSats: string;
  initialOpen: boolean;
  setAmountSats: (s: bigint) => void;
}> = (props) => {
  const [isOpen, setIsOpen] = createSignal(props.initialOpen);
  const [store, _actions] = useMegaStore();

  const [displayAmount, setDisplayAmount] = createSignal(props.initialAmountSats || "0");

  const [inboundCapacity] = createResource(async () => {
    const channels = await store.mutiny_wallet?.list_channels();
    let inbound = 0;

    for (const channel of channels) {
      inbound += channel.size - (channel.balance + channel.reserve);
    }

    return inbound;
  });

  const warningText = () => {
    if ((store.balance?.lightning || 0n) === 0n) {
      const network = state.mutiny_wallet?.get_network() as Network;
      if (network === "bitcoin") {
        return "Your first lightning receive needs to be 50,000 sats or greater.";
      } else {
        return "Your first lightning receive needs to be 10,000 sats or greater.";
      }
    }

    const parsed = Number(displayAmount());
    if (isNaN(parsed)) {
      return undefined;
    }

    if (parsed > (inboundCapacity() || 0)) {
      return "A lightning setup fee will be charged if paid over lightning.";
    }

    return undefined;
  };

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
    inputRef.focus();
  }

  // making a "controlled" input is a known hard problem
  // https://github.com/solidjs/solid/discussions/416
  function handleHiddenInput(
    e: Event & {
      currentTarget: HTMLInputElement;
      target: HTMLInputElement;
    }
  ) {
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
      return "scale-90";
    } else if (chars > 8) {
      return "scale-95";
    } else if (chars > 7) {
      return "scale-100";
    } else if (chars > 6) {
      return "scale-105";
    } else if (chars > 5) {
      return "scale-110";
    } else if (chars > 4) {
      return "scale-125";
    } else {
      return "scale-150";
    }
  });

  const prettyPrint = createMemo(() => {
    const parsed = Number(displayAmount());
    if (isNaN(parsed)) {
      return displayAmount();
    } else {
      return parsed.toLocaleString();
    }
  });

  // Fiat conversion
  const [state, _] = useMegaStore();

  const amountInUsd = () => satsToUsd(state.price, Number(displayAmount()) || 0, true);

  // What we're all here for in the first place: returning a value
  function handleSubmit(e: SubmitEvent | MouseEvent) {
    e.preventDefault();

    // validate it's a number
    console.log("handling submit...");
    console.log(displayAmount());
    const number = Number(displayAmount());
    if (isNaN(number) || number < 0) {
      setDisplayAmount("0");
      inputRef.focus();
      return;
    } else {
      const bign = BigInt(displayAmount());
      props.setAmountSats(bign);
    }

    setIsOpen(false);
  }

  return (
    <Dialog.Root open={isOpen()}>
      <button
        onClick={() => setIsOpen(true)}
        class="px-4 py-2 rounded-xl border-2 border-m-blue flex gap-2 items-center"
      >
        {/* <Amount amountSats={Number(displayAmount())} showFiat /><span>&#x270F;&#xFE0F;</span> */}
        <Show
          when={displayAmount() !== "0"}
          fallback={<div class="inline-block font-semibold">Set amount</div>}
        >
          <InlineAmount amount={displayAmount()} />
        </Show>
        <img src={pencil} alt="Edit" />
        {/* {props.children} */}
      </button>
      <Dialog.Portal>
        {/* <Dialog.Overlay class={OVERLAY} /> */}
        <div class={DIALOG_POSITIONER}>
          <Dialog.Content class={DIALOG_CONTENT} onEscapeKeyDown={() => setIsOpen(false)}>
            {/* TODO: figure out how to submit on enter */}
            <div class="w-full flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                class="hover:bg-white/10 rounded-lg active:bg-m-blue w-8 h-8"
              >
                <img src={close} alt="Close" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                ref={(el) => (inputRef = el)}
                autofocus
                inputmode="none"
                type="text"
                class="opacity-0 absolute -z-10"
                value={displayAmount()}
                onInput={(e) => handleHiddenInput(e)}
              />
            </form>
            <div class="flex flex-col flex-1 justify-around gap-2 max-w-[400px] mx-auto w-full">
              <div class="w-full p-4 flex flex-col gap-4 items-center justify-center">
                <h1
                  class={`font-light text-center transition-transform ease-out duration-300 text-4xl ${scale()}`}
                >
                  {prettyPrint()}&nbsp;<span class="text-xl">SATS</span>
                </h1>
                <h2 class="text-xl font-light text-white/70">
                  &#8776; {amountInUsd()} <span class="text-sm">USD</span>
                </h2>
              </div>
              <Show when={warningText()}>
                <InfoBox accent="green">{warningText()}</InfoBox>
              </Show>
              <div class="flex justify-center gap-4 my-2">
                <For each={FIXED_AMOUNTS}>
                  {(amount) => (
                    <button
                      onClick={() => setDisplayAmount(amount.amount)}
                      class="py-2 px-4 rounded-lg bg-white/10"
                    >
                      {amount.label}
                    </button>
                  )}
                </For>
              </div>
              <div class="grid grid-cols-3 w-full flex-none">
                <For each={CHARACTERS}>
                  {(character) => (
                    <SingleDigitButton
                      fiat={false}
                      character={character}
                      onClick={handleCharacterInput}
                    />
                  )}
                </For>
              </div>
              <Button intent="blue" class="w-full flex-none" onClick={handleSubmit}>
                Set Amount
              </Button>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
