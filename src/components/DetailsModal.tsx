import { Dialog } from "@kobalte/core";
import {
    For,
    Match,
    ParentComponent,
    Show,
    Suspense,
    Switch,
    createEffect,
    createMemo,
    createResource
} from "solid-js";
import { Hr, ModalCloseButton, TinyButton, VStack } from "~/components/layout";
import { MutinyChannel, MutinyInvoice } from "@mutinywallet/mutiny-wasm";
import { OnChainTx } from "./Activity";

import bolt from "~/assets/icons/bolt-black.svg";
import chain from "~/assets/icons/chain-black.svg";
import copyIcon from "~/assets/icons/copy.svg";
import shuffle from "~/assets/icons/shuffle-black.svg";

import { ActivityAmount, HackActivityType } from "./ActivityItem";
import { CopyButton, TruncateMiddle } from "./ShareCard";
import { prettyPrintTime } from "~/utils/prettyPrintTime";
import { useMegaStore } from "~/state/megaStore";
import { MutinyTagItem, tagToMutinyTag } from "~/utils/tags";
import { useCopy } from "~/utils/useCopy";
import mempoolTxUrl from "~/utils/mempoolTxUrl";
import { Network } from "~/logic/mutinyWalletSetup";
import { AmountSmall } from "./Amount";
import { ExternalLink } from "./layout/ExternalLink";
import { InfoBox } from "./InfoBox";
import { useI18n } from "~/i18n/context";

type ChannelClosure = {
    channel_id: string;
    node_id: string;
    reason: string;
    timestamp: number;
};

export const OVERLAY = "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm";
export const DIALOG_POSITIONER =
    "fixed inset-0 z-50 flex items-center justify-center";
export const DIALOG_CONTENT =
    "max-w-[500px] w-[90vw] max-h-[100dvh] overflow-y-scroll disable-scrollbars mx-4 p-4 bg-neutral-800/80 backdrop-blur-md shadow-xl rounded-xl border border-white/10";

function LightningHeader(props: {
    info: MutinyInvoice;
    tags: MutinyTagItem[];
}) {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    return (
        <div class="flex flex-col items-center gap-4">
            <div class="p-4 bg-neutral-100 rounded-full">
                <img src={bolt} alt="lightning bolt" class="w-8 h-8" />
            </div>
            <h1 class="uppercase font-semibold">
                {props.info.inbound
                    ? i18n.t("modals.transaction_details.lightning_receive")
                    : i18n.t("modals.transaction_details.lightning_send")}
            </h1>
            <ActivityAmount
                center
                amount={props.info.amount_sats?.toString() ?? "0"}
                price={state.price}
                positive={props.info.inbound}
            />
            <For each={props.tags}>
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

function OnchainHeader(props: {
    info: OnChainTx;
    tags: MutinyTagItem[];
    kind?: HackActivityType;
}) {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

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
                    <Match
                        when={
                            props.kind === "ChannelOpen" ||
                            props.kind === "ChannelClose"
                        }
                    >
                        <img src={shuffle} alt="swap" class="w-8 h-8" />
                    </Match>
                    <Match when={true}>
                        <img src={chain} alt="blockchain" class="w-8 h-8" />
                    </Match>
                </Switch>
            </div>
            <h1 class="uppercase font-semibold">
                {props.kind === "ChannelOpen"
                    ? i18n.t("modals.transaction_details.channel_open")
                    : props.kind === "ChannelClose"
                    ? i18n.t("modals.transaction_details.channel_close")
                    : isSend()
                    ? i18n.t("modals.transaction_details.onchain_send")
                    : i18n.t("modals.transaction_details.onchain_receive")}
            </h1>
            <Show when={props.kind !== "ChannelClose"}>
                <ActivityAmount
                    center
                    amount={amount() ?? "0"}
                    price={state.price}
                    positive={!isSend()}
                />
            </Show>
            <For each={props.tags}>
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

export const KeyValue: ParentComponent<{ key: string }> = (props) => {
    return (
        <li class="flex justify-between items-center gap-4">
            <span class="uppercase font-semibold whitespace-nowrap text-sm">
                {props.key}
            </span>
            <span class="font-light">{props.children}</span>
        </li>
    );
};

export function MiniStringShower(props: { text: string }) {
    const [copy, copied] = useCopy({ copiedTimeout: 1000 });

    return (
        <div class="w-full grid gap-1 grid-cols-[minmax(0,_1fr)_auto]">
            <TruncateMiddle text={props.text} />
            {/* <pre class="truncate text-neutral-300 font-light">{props.text}</pre> */}
            <button
                class="w-[1.5rem] p-1"
                classList={{ "bg-m-green rounded": copied() }}
                onClick={() => copy(props.text)}
            >
                <img src={copyIcon} alt="copy" class="w-4 h-4" />
            </button>
        </div>
    );
}

function LightningDetails(props: { info: MutinyInvoice }) {
    const i18n = useI18n();
    return (
        <VStack>
            <ul class="flex flex-col gap-4">
                <KeyValue key={i18n.t("modals.transaction_details.status")}>
                    <span class="text-neutral-300">
                        {props.info.paid
                            ? i18n.t("modals.transaction_details.paid")
                            : i18n.t("modals.transaction_details.unpaid")}
                    </span>
                </KeyValue>
                <KeyValue key={i18n.t("modals.transaction_details.when")}>
                    <span class="text-neutral-300">
                        {prettyPrintTime(Number(props.info.last_updated))}
                    </span>
                </KeyValue>
                <Show when={props.info.description}>
                    <KeyValue
                        key={i18n.t("modals.transaction_details.description")}
                    >
                        <span class="text-neutral-300 truncate">
                            {props.info.description}
                        </span>
                    </KeyValue>
                </Show>
                <KeyValue key={i18n.t("modals.transaction_details.fees")}>
                    <span class="text-neutral-300">
                        <AmountSmall amountSats={props.info.fees_paid} />
                    </span>
                </KeyValue>
                <KeyValue key={i18n.t("modals.transaction_details.bolt11")}>
                    <MiniStringShower text={props.info.bolt11 ?? ""} />
                </KeyValue>
                <KeyValue
                    key={i18n.t("modals.transaction_details.payment_hash")}
                >
                    <MiniStringShower text={props.info.payment_hash ?? ""} />
                </KeyValue>
                <KeyValue key={i18n.t("modals.transaction_details.preimage")}>
                    <MiniStringShower text={props.info.preimage ?? ""} />
                </KeyValue>
            </ul>
        </VStack>
    );
}

function OnchainDetails(props: { info: OnChainTx; kind?: HackActivityType }) {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const confirmationTime = () => {
        return props.info.confirmation_time?.Confirmed?.time;
    };

    const network = state.mutiny_wallet?.get_network() as Network;

    // Can return nothing if the channel is already closed
    const [channelInfo] = createResource(async () => {
        if (props.kind === "ChannelOpen") {
            try {
                const channels =
                    await (state.mutiny_wallet?.list_channels() as Promise<
                        MutinyChannel[]
                    >);
                const channel = channels.find((channel) =>
                    channel.outpoint?.startsWith(props.info.txid)
                );
                return channel;
            } catch (e) {
                console.error(e);
            }
        } else {
            return undefined;
        }
    });

    return (
        <VStack>
            {/* <pre>{JSON.stringify(channelInfo() || "", null, 2)}</pre> */}
            <ul class="flex flex-col gap-4">
                <KeyValue key={i18n.t("modals.transaction_details.status")}>
                    <span class="text-neutral-300">
                        {confirmationTime()
                            ? i18n.t("modals.transaction_details.confirmed")
                            : i18n.t("modals.transaction_details.unconfirmed")}
                    </span>
                </KeyValue>
                <Show when={confirmationTime()}>
                    <KeyValue key={i18n.t("modals.transaction_details.when")}>
                        <span class="text-neutral-300">
                            {confirmationTime()
                                ? prettyPrintTime(Number(confirmationTime()))
                                : "Pending"}
                        </span>
                    </KeyValue>
                </Show>
                <Show when={props.info.fee && props.info.fee > 0}>
                    <KeyValue key={i18n.t("modals.transaction_details.fee")}>
                        <span class="text-neutral-300">
                            <AmountSmall amountSats={props.info.fee} />
                        </span>
                    </KeyValue>
                </Show>
                <KeyValue key={i18n.t("modals.transaction_details.txid")}>
                    <MiniStringShower text={props.info.txid ?? ""} />
                </KeyValue>
                <Switch>
                    <Match when={props.kind === "ChannelOpen" && channelInfo()}>
                        <KeyValue
                            key={i18n.t("modals.transaction_details.balance")}
                        >
                            <span class="text-neutral-300">
                                <AmountSmall
                                    amountSats={channelInfo()?.balance}
                                />
                            </span>
                        </KeyValue>
                        <KeyValue
                            key={i18n.t("modals.transaction_details.reserve")}
                        >
                            <span class="text-neutral-300">
                                <AmountSmall
                                    amountSats={channelInfo()?.reserve}
                                />
                            </span>
                        </KeyValue>
                        <KeyValue
                            key={i18n.t("modals.transaction_details.peer")}
                        >
                            <span class="text-neutral-300">
                                <MiniStringShower
                                    text={channelInfo()?.peer ?? ""}
                                />
                            </span>
                        </KeyValue>
                    </Match>
                    <Match when={props.kind === "ChannelOpen"}>
                        <InfoBox accent="blue">
                            {i18n.t("modals.transaction_details.no_details")}
                        </InfoBox>
                    </Match>
                </Switch>
            </ul>
            <div class="text-center">
                <ExternalLink href={mempoolTxUrl(props.info.txid, network)}>
                    {i18n.t("common.view_transaction")}
                </ExternalLink>
            </div>
        </VStack>
    );
}

function ChannelCloseDetails(props: { info: ChannelClosure }) {
    const i18n = useI18n();
    return (
        <VStack>
            {/* <pre>{JSON.stringify(props.info.value, null, 2)}</pre> */}
            <ul class="flex flex-col gap-4">
                <KeyValue key={i18n.t("modals.transaction_details.channel_id")}>
                    <MiniStringShower text={props.info.channel_id ?? ""} />
                </KeyValue>
                <Show when={props.info.timestamp}>
                    <KeyValue key={i18n.t("modals.transaction_details.when")}>
                        <span class="text-neutral-300">
                            {props.info.timestamp
                                ? prettyPrintTime(Number(props.info.timestamp))
                                : i18n.t("common.pending")}
                        </span>
                    </KeyValue>
                </Show>
                <KeyValue key={i18n.t("modals.transaction_details.reason")}>
                    <p class="text-neutral-300 text-right">
                        {props.info.reason ?? ""}
                    </p>
                </KeyValue>
            </ul>
        </VStack>
    );
}

export function DetailsIdModal(props: {
    open: boolean;
    kind?: HackActivityType;
    id: string;
    setOpen: (open: boolean) => void;
}) {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const id = () => props.id;
    const kind = () => props.kind;

    // TODO: is there a cleaner way to do refetch when id changes?
    const [data, { refetch }] = createResource(async () => {
        try {
            if (kind() === "Lightning") {
                console.debug("reading invoice: ", id());
                const invoice = await state.mutiny_wallet?.get_invoice_by_hash(
                    id()
                );
                return invoice;
            } else if (kind() === "ChannelClose") {
                console.debug("reading channel close: ", id());
                const closeItem =
                    await state.mutiny_wallet?.get_channel_closure(id());

                return closeItem;
            } else {
                console.debug("reading tx: ", id());
                const tx = await state.mutiny_wallet?.get_transaction(id());

                return tx;
            }
        } catch (e) {
            console.error(e);
            return undefined;
        }
    });

    const tags = createMemo(() => {
        if (data() && data().labels && data().labels.length > 0) {
            try {
                const contact = state.mutiny_wallet?.get_contact(
                    data().labels[0]
                );
                if (contact) {
                    return [tagToMutinyTag(contact)];
                } else {
                    return [];
                }
            } catch (e) {
                console.error(e);
                return [];
            }
        } else {
            return [];
        }
    });

    createEffect(() => {
        if (props.id && props.kind && props.open) {
            refetch();
        }
    });

    const json = createMemo(() => JSON.stringify(data() || "", null, 2));

    return (
        <Dialog.Root open={props.open} onOpenChange={props.setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay class={OVERLAY} />
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT}>
                        <Suspense>
                            <div class="flex justify-between mb-2">
                                <div />
                                <Dialog.CloseButton>
                                    <ModalCloseButton />
                                </Dialog.CloseButton>
                            </div>
                            <Dialog.Title>
                                <Switch>
                                    <Match when={props.kind === "Lightning"}>
                                        <LightningHeader
                                            info={data() as MutinyInvoice}
                                            tags={tags()}
                                        />
                                    </Match>
                                    <Match
                                        when={
                                            props.kind === "OnChain" ||
                                            props.kind === "ChannelOpen" ||
                                            props.kind === "ChannelClose"
                                        }
                                    >
                                        <OnchainHeader
                                            info={data() as OnChainTx}
                                            tags={tags()}
                                            kind={props.kind}
                                        />
                                    </Match>
                                </Switch>
                            </Dialog.Title>
                            <Hr />
                            <Dialog.Description class="flex flex-col gap-4">
                                <Switch>
                                    <Match when={props.kind === "Lightning"}>
                                        <LightningDetails
                                            info={data() as MutinyInvoice}
                                        />
                                    </Match>
                                    <Match
                                        when={
                                            props.kind === "OnChain" ||
                                            props.kind === "ChannelOpen"
                                        }
                                    >
                                        <OnchainDetails
                                            info={data() as OnChainTx}
                                            kind={props.kind}
                                        />
                                    </Match>
                                    <Match when={props.kind === "ChannelClose"}>
                                        <ChannelCloseDetails
                                            info={data() as ChannelClosure}
                                        />
                                    </Match>
                                </Switch>
                                <Show when={props.kind !== "ChannelClose"}>
                                    <div class="flex justify-center">
                                        <CopyButton
                                            title={i18n.t("common.copy")}
                                            text={json()}
                                        />
                                    </div>
                                </Show>
                            </Dialog.Description>
                        </Suspense>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
