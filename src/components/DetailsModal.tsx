import { Dialog } from "@kobalte/core"
import {
  For,
  JSX,
  Match,
  ParentComponent,
  Show,
  Switch,
  createMemo,
  createResource
} from "solid-js";
import { Hr, ModalCloseButton, TinyButton, VStack } from "~/components/layout";
import { MutinyChannel, MutinyInvoice } from "@mutinywallet/mutiny-wasm";
import { OnChainTx } from "./Activity";

import bolt from "~/assets/icons/bolt-black.svg";
import chain from "~/assets/icons/chain-black.svg";
import shuffle from "~/assets/icons/shuffle-black.svg";
import copyIcon from "~/assets/icons/copy.svg";

import { ActivityAmount } from "./ActivityItem";
import { CopyButton } from "./ShareCard";
import { prettyPrintTime } from "~/utils/prettyPrintTime";
import { useMegaStore } from "~/state/megaStore";
import { tagToMutinyTag } from "~/utils/tags";
import { useCopy } from "~/utils/useCopy";
import mempoolTxUrl from "~/utils/mempoolTxUrl";
import { Network } from "~/logic/mutinyWalletSetup";
import { AmountSmall } from "./Amount";

export const OVERLAY = "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm";
export const DIALOG_POSITIONER = "fixed inset-0 z-50 flex items-center justify-center";
export const DIALOG_CONTENT =
  "max-w-[500px] w-[90vw] max-h-[100dvh] overflow-y-scroll disable-scrollbars mx-4 p-4 bg-neutral-800/80 backdrop-blur-md shadow-xl rounded-xl border border-white/10";

function LightningHeader(props: { info: MutinyInvoice }) {
  const [state, _actions] = useMegaStore();

  const tags = createMemo(() => {
    if (props.info.labels.length) {
      const contact = state.mutiny_wallet?.get_contact(props.info.labels[0]);
      if (contact) {
        return [tagToMutinyTag(contact)];
      } else {
        return [];
      }
    } else {
      return [];
    }
  });

  return (
    <div class="flex flex-col items-center gap-4">
      <div class="p-4 bg-neutral-100 rounded-full">
        <img src={bolt} alt="lightning bolt" class="w-8 h-8" />
      </div>
      <h1 class="uppercase font-semibold">
        {props.info.is_send ? "Lightning send" : "Lightning receive"}
      </h1>
      <ActivityAmount
        center
        amount={props.info.amount_sats?.toString() ?? "0"}
        price={state.price}
        positive={!props.info.is_send}
      />
      <For each={tags()}>
        {(tag) => (
          <TinyButton
            tag={tag}
            onClick={() => {
              // noop
            }}
          >
            {tag.name}
          </TinyButton>
        )}
      </For>
    </div>
  );
}

function OnchainHeader(props: { info: OnChainTx }) {
  const [state, _actions] = useMegaStore();

  const getChannelInfo = async () => {
    const isChannel = props.info.labels.find((label) => label.startsWith("LN Channel"));

    if (isChannel) {
      const channels = await (state.mutiny_wallet?.list_channels() as Promise<MutinyChannel[]>);
      const thisChannel = channels.find((channel) => channel.outpoint?.startsWith(props.info.txid));
      return thisChannel;
    }
  };

  const [channelInfo] = createResource(getChannelInfo);

  const tags = createMemo(() => {
    if (props.info.labels.length) {
      const contact = state.mutiny_wallet?.get_contact(props.info.labels[0]);
      if (contact) {
        return [tagToMutinyTag(contact)];
      } else {
        return [];
      }
    } else {
      return [];
    }
  });

  const isSend = () => {
    return props.info.sent > props.info.received;
  };

  const amount = () => {
    if (isSend()) {
      return (props.info.sent - props.info.received).toString();
    } else {
      return (props.info.received - props.info.sent).toString();
    }
  };

  return (
    <div class="flex flex-col items-center gap-4">
      <div class="p-4 bg-neutral-100 rounded-full">
        <Switch>
          <Match when={channelInfo()}>
            <img src={shuffle} alt="swap" class="w-8 h-8" />
          </Match>
          <Match when={true}>
            <img src={chain} alt="blockchain" class="w-8 h-8" />
          </Match>
        </Switch>
      </div>
      <h1 class="uppercase font-semibold">
        {channelInfo() ? "Channel open" : isSend() ? "On-chain send" : "On-chain receive"}
      </h1>
      <ActivityAmount center amount={amount() ?? "0"} price={state.price} positive={!isSend()} />
      <For each={tags()}>
        {(tag) => (
          <TinyButton
            tag={tag}
            onClick={() => {
              // noop
            }}
          >
            {tag.name}
          </TinyButton>
        )}
      </For>
    </div>
  );
}

const KeyValue: ParentComponent<{ key: string }> = (props) => {
  return (
    <li class="flex justify-between items-center gap-4">
      <span class="uppercase font-semibold whitespace-nowrap">{props.key}</span>
      <span class="font-light">{props.children}</span>
    </li>
  );
};

function MiniStringShower(props: { text: string }) {
  const [copy, _copied] = useCopy({ copiedTimeout: 1000 });

  return (
    <div class="w-full grid gap-1 grid-cols-[minmax(0,_1fr)_auto]">
      <pre class="truncate text-neutral-300 font-light">{props.text}</pre>
      <button class="w-[1rem]" onClick={() => copy(props.text)}>
        <img src={copyIcon} alt="copy" class="w-4 h-4" />
      </button>
    </div>
  );
}

function LightningDetails(props: { info: MutinyInvoice }) {
  return (
    <VStack>
      <ul class="flex flex-col gap-4">
        <KeyValue key="Status">
          <span class="text-neutral-300">{props.info.paid ? "Paid" : "Unpaid"}</span>
        </KeyValue>
        <KeyValue key="When">
          <span class="text-neutral-300">{prettyPrintTime(Number(props.info.last_updated))}</span>
        </KeyValue>
        <Show when={props.info.description}>
          <KeyValue key="Description">
            <span class="text-neutral-300 truncate">{props.info.description}</span>
          </KeyValue>
        </Show>
        <KeyValue key="Fees">
          <span class="text-neutral-300">
            <AmountSmall amountSats={props.info.fees_paid} />
          </span>
        </KeyValue>
        <KeyValue key="Bolt11">
          <MiniStringShower text={props.info.bolt11 ?? ""} />
        </KeyValue>
        <KeyValue key="Payment Hash">
          <MiniStringShower text={props.info.payment_hash ?? ""} />
        </KeyValue>
        <KeyValue key="Preimage">
          <MiniStringShower text={props.info.preimage ?? ""} />
        </KeyValue>
      </ul>
    </VStack>
  );
}

function OnchainDetails(props: { info: OnChainTx }) {
  const [state, _actions] = useMegaStore();

  const confirmationTime = () => {
    return props.info.confirmation_time?.Confirmed?.time;
  };

  const getChannelInfo = async () => {
    const isChannel = props.info.labels.find((label) => label.startsWith("LN Channel"));

    if (isChannel) {
      const channels = await (state.mutiny_wallet?.list_channels() as Promise<MutinyChannel[]>);
      const thisChannel = channels.find((channel) => channel.outpoint?.startsWith(props.info.txid));
      return thisChannel;
    }
  };

  const [channelInfo] = createResource(getChannelInfo);

  const network = state.mutiny_wallet?.get_network() as Network;

  return (
    <VStack>
      <ul class="flex flex-col gap-4">
        <KeyValue key="Status">
          <span class="text-neutral-300">{confirmationTime() ? "Confirmed" : "Unconfirmed"}</span>
        </KeyValue>
        <Show when={confirmationTime()}>
          <KeyValue key="When">
            <span class="text-neutral-300">
              {confirmationTime() ? prettyPrintTime(Number(confirmationTime())) : "Pending"}
            </span>
          </KeyValue>
        </Show>
        <KeyValue key="Fee">
          <span class="text-neutral-300">
            <AmountSmall amountSats={props.info.fee} />
          </span>
        </KeyValue>
        <Show when={channelInfo()}>
          <KeyValue key="Reserve">
            <span class="text-neutral-300">
              <AmountSmall amountSats={channelInfo()?.reserve} />
            </span>
          </KeyValue>
          <KeyValue key="Balance">
            <span class="text-neutral-300">
              <AmountSmall amountSats={channelInfo()?.balance} />
            </span>
          </KeyValue>
          <KeyValue key="Peer">
            <span class="text-neutral-300">
              <MiniStringShower text={channelInfo()?.peer ?? ""} />
            </span>
          </KeyValue>
        </Show>
        <KeyValue key="Txid">
          <MiniStringShower text={props.info.txid ?? ""} />
        </KeyValue>
      </ul>
      <a
        class="uppercase font-light text-center"
        href={mempoolTxUrl(props.info.txid, network)}
        target="_blank"
        rel="noreferrer"
      >
        Mempool.space
      </a>
    </VStack>
  );
}

export function DetailsModal(props: {
  open: boolean
  data: MutinyInvoice | OnChainTx
  setOpen: (open: boolean) => void
  children?: JSX.Element
}) {
  const json = createMemo(() => JSON.stringify(props.data, null, 2))

  const isInvoice = () => {
    return ("bolt11" in props.data) as boolean
  }

  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.setOpen}
    >
      <Dialog.Portal>
        <Dialog.Overlay class={OVERLAY} />
        <div class={DIALOG_POSITIONER}>
          <Dialog.Content class={DIALOG_CONTENT}>
            <div class="flex justify-between mb-2">
              <div />
              <Dialog.CloseButton>
                <ModalCloseButton />
              </Dialog.CloseButton>
            </div>
            <Dialog.Title>
              <Switch>
                <Match when={isInvoice()}>
                  <LightningHeader info={props.data as MutinyInvoice} />
                </Match>
                <Match when={true}>
                  <OnchainHeader info={props.data as OnChainTx} />
                </Match>
              </Switch>
            </Dialog.Title>
            <Hr />
            <Dialog.Description class="flex flex-col gap-4">
              <Switch>
                <Match when={isInvoice()}>
                  <LightningDetails info={props.data as MutinyInvoice} />
                </Match>
                <Match when={true}>
                  <OnchainDetails info={props.data as OnChainTx} />
                </Match>
              </Switch>
              <div class="flex justify-center">
                <CopyButton title="Copy" text={json()} />
              </div>
            </Dialog.Description>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
