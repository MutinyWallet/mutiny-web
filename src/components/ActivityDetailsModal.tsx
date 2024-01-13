import { Dialog } from "@kobalte/core";
import {
    MutinyChannel,
    MutinyInvoice,
    TagItem
} from "@mutinywallet/mutiny-wasm";
import { Copy, Link, Shuffle, Zap } from "lucide-solid";
import {
    createEffect,
    createMemo,
    createResource,
    Match,
    ParentComponent,
    Show,
    Suspense,
    Switch
} from "solid-js";

import {
    AmountFiat,
    AmountSats,
    FancyCard,
    HackActivityType,
    Hr,
    InfoBox,
    KeyValue,
    ModalCloseButton,
    TinyButton,
    TruncateMiddle,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { Network } from "~/logic/mutinyWalletSetup";
import { BalanceBar } from "~/routes/settings/Channels";
import { useMegaStore } from "~/state/megaStore";
import { mempoolTxUrl, prettyPrintTime, useCopy } from "~/utils";

interface ChannelClosure {
    channel_id: string;
    node_id: string;
    reason: string;
    timestamp: number;
}

interface OnChainTx {
    txid: string;
    received: number;
    sent: number;
    fee?: number;
    confirmation_time?: {
        Confirmed?: {
            height: number;
            time: number;
        };
    };
    labels: string[];
}

const ActivityAmount: ParentComponent<{
    amount: string;
    price: number;
    positive?: boolean;
    center?: boolean;
}> = (props) => {
    return (
        <div
            class="flex flex-col gap-1"
            classList={{
                "items-end": !props.center,
                "items-center": props.center
            }}
        >
            <div
                class="justify-end"
                classList={{ "text-m-green": props.positive }}
            >
                <AmountSats
                    amountSats={Number(props.amount)}
                    icon={props.positive ? "plus" : undefined}
                />
            </div>
            <div class="text-sm text-white/70">
                <AmountFiat
                    amountSats={Number(props.amount)}
                    denominationSize="sm"
                />
            </div>
        </div>
    );
};

export const OVERLAY = "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm";
export const DIALOG_POSITIONER =
    "fixed inset-0 z-50 flex items-center justify-center";
export const DIALOG_CONTENT =
    "max-w-[500px] w-[90vw] max-h-device overflow-y-scroll disable-scrollbars bg-neutral-900/80 backdrop-blur-md shadow-xl rounded-xl border border-white/10";

function LightningHeader(props: { info: MutinyInvoice }) {
    const i18n = useI18n();

    return (
        <div class="flex flex-col items-center gap-4">
            <div class="flex flex-row items-center justify-center gap-[4px] font-normal">
                {props.info.inbound
                    ? i18n.t("activity.transaction_details.lightning_receive")
                    : i18n.t("activity.transaction_details.lightning_send")}
                <Zap class="h-4 w-4" />
            </div>
            <div class="flex flex-col items-center">
                <div
                    class="text-2xl"
                    classList={{ "text-m-green": props.info.inbound }}
                >
                    <AmountSats
                        amountSats={props.info.amount_sats}
                        icon={props.info.inbound ? "plus" : undefined}
                        denominationSize="lg"
                    />
                </div>
                <div class="text-lg text-white/70">
                    <AmountFiat
                        amountSats={props.info.amount_sats}
                        denominationSize="sm"
                    />
                </div>
            </div>
        </div>
    );
}

function OnchainHeader(props: { info: OnChainTx; kind?: HackActivityType }) {
    const i18n = useI18n();

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
            <div class="flex flex-row items-center justify-center gap-[4px] font-normal">
                {props.kind === "ChannelOpen"
                    ? i18n.t("activity.transaction_details.channel_open")
                    : props.kind === "ChannelClose"
                    ? i18n.t("activity.transaction_details.channel_close")
                    : isSend()
                    ? i18n.t("activity.transaction_details.onchain_send")
                    : i18n.t("activity.transaction_details.onchain_receive")}
                <Switch>
                    <Match
                        when={
                            props.kind === "ChannelOpen" ||
                            props.kind === "ChannelClose"
                        }
                    >
                        <Shuffle class="h-4 w-4" />
                    </Match>
                    <Match when={true}>
                        <Link class="h-4 w-4" />
                    </Match>
                </Switch>
            </div>
            <Show when={props.kind !== "ChannelClose"}>
                <div class="flex flex-col items-center">
                    <div
                        class="text-2xl"
                        classList={{ "text-m-green": !isSend() }}
                    >
                        <AmountSats
                            amountSats={Number(amount())}
                            icon={!isSend() ? "plus" : undefined}
                            denominationSize="lg"
                        />
                    </div>
                    <div class="text-lg text-white/70">
                        <AmountFiat
                            amountSats={Number(amount())}
                            denominationSize="sm"
                        />
                    </div>
                </div>
            </Show>
        </div>
    );
}

export function MiniStringShower(props: { text: string }) {
    const [copy, copied] = useCopy({ copiedTimeout: 1000 });

    return (
        <div class="grid w-full grid-cols-[minmax(0,_1fr)_auto] gap-1">
            <TruncateMiddle text={props.text} />
            <button
                class="w-[1.5rem] p-1"
                classList={{ "bg-m-green rounded": copied() }}
                onClick={() => copy(props.text)}
            >
                <Copy class="h-4 w-4" />
            </button>
        </div>
    );
}

function FormatPrettyPrint(props: { ts: number }) {
    return (
        <div>
            {prettyPrintTime(props.ts).split(",", 2).join(",")}
            <div class="text-right text-sm text-white/70">
                {prettyPrintTime(props.ts).split(", ")[2]}
            </div>
        </div>
    );
}

function LightningDetails(props: { info: MutinyInvoice; tags?: TagItem }) {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();
    return (
        <VStack>
            <ul class="flex flex-col gap-4">
                <KeyValue key={i18n.t("activity.transaction_details.fee")}>
                    <ActivityAmount
                        amount={props.info.fees_paid?.toString() || "0"}
                        price={state.price}
                    />
                </KeyValue>
                <Show when={props.tags || props.info.labels[0]}>
                    <KeyValue
                        key={i18n.t("activity.transaction_details.tagged_to")}
                    >
                        <TinyButton
                            tag={props.tags?.value ?? undefined}
                            onClick={() => {
                                // noop
                            }}
                        >
                            {props.tags?.name || props.info.labels[0]}
                        </TinyButton>
                    </KeyValue>
                </Show>
                <Show when={!props.info.paid}>
                    <KeyValue
                        key={i18n.t("activity.transaction_details.status")}
                    >
                        i18n.t("activity.transaction_details.unpaid")
                    </KeyValue>
                </Show>
                <KeyValue key={i18n.t("activity.transaction_details.date")}>
                    <FormatPrettyPrint ts={Number(props.info.last_updated)} />
                </KeyValue>
                <Show when={props.info.description}>
                    <KeyValue
                        key={i18n.t("activity.transaction_details.description")}
                    >
                        <span class="pl-6">{props.info.description}</span>
                    </KeyValue>
                </Show>
                <KeyValue key={i18n.t("activity.transaction_details.invoice")}>
                    <MiniStringShower text={props.info.bolt11 ?? ""} />
                </KeyValue>
                <Show when={props.info.paid && !props.info.inbound}>
                    <KeyValue
                        key={i18n.t(
                            "activity.transaction_details.payment_preimage"
                        )}
                    >
                        <MiniStringShower text={props.info.preimage ?? ""} />
                    </KeyValue>
                </Show>
            </ul>
        </VStack>
    );
}

function OnchainDetails(props: {
    info: OnChainTx;
    kind?: HackActivityType;
    tags?: TagItem;
}) {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();
    const [copy, copied] = useCopy({ copiedTimeout: 1000 });

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
                const channel = channels.find(
                    (channel) => channel.outpoint?.startsWith(props.info.txid)
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
                <Switch>
                    <Match when={props.kind === "ChannelOpen" && channelInfo()}>
                        <BalanceBar
                            inbound={
                                Number(channelInfo()?.size) -
                                    (Number(channelInfo()?.balance) +
                                        Number(channelInfo()?.reserve)) || 0
                            }
                            reserve={Number(channelInfo()?.reserve) || 0}
                            outbound={Number(channelInfo()?.balance) || 0}
                        />
                        <KeyValue
                            key={i18n.t("activity.transaction_details.total")}
                        >
                            <ActivityAmount
                                amount={channelInfo()!.size.toString()}
                                price={state.price}
                            />
                        </KeyValue>
                        <KeyValue
                            key={i18n.t(
                                "activity.transaction_details.onchain_fee"
                            )}
                        >
                            <ActivityAmount
                                amount={props.info.fee!.toString()}
                                price={state.price}
                            />
                        </KeyValue>
                    </Match>
                    <Match when={props.kind === "ChannelOpen"}>
                        <InfoBox accent="blue">
                            {i18n.t("activity.transaction_details.no_details")}
                        </InfoBox>
                    </Match>
                </Switch>
                <Show
                    when={
                        props.kind !== "ChannelOpen" &&
                        props.info.fee &&
                        props.info.fee > 0
                    }
                >
                    <KeyValue
                        key={i18n.t("activity.transaction_details.onchain_fee")}
                    >
                        <ActivityAmount
                            amount={props.info.fee!.toString()}
                            price={state.price}
                        />
                    </KeyValue>
                </Show>
                <Show when={props.tags && props.kind === "OnChain"}>
                    <KeyValue
                        key={i18n.t("activity.transaction_details.tagged_to")}
                    >
                        <TinyButton
                            tag={props.tags?.value ?? undefined}
                            onClick={() => {
                                // noop
                            }}
                        >
                            {props.tags?.name || props.info.labels[0]}
                        </TinyButton>
                    </KeyValue>
                </Show>
                <KeyValue key={i18n.t("activity.transaction_details.status")}>
                    {confirmationTime()
                        ? i18n.t("activity.transaction_details.confirmed")
                        : i18n.t("activity.transaction_details.unconfirmed")}
                </KeyValue>
                <KeyValue key={i18n.t("activity.transaction_details.date")}>
                    {confirmationTime() ? (
                        <FormatPrettyPrint ts={Number(confirmationTime())} />
                    ) : (
                        "Pending"
                    )}
                </KeyValue>
                <KeyValue key={i18n.t("activity.transaction_details.txid")}>
                    <div class="flex gap-1">
                        {/* Have to do all these shenanigans because css / html is hard */}
                        <div class="grid w-full grid-cols-[minmax(0,_1fr)_auto] gap-1">
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={mempoolTxUrl(props.info.txid, network)}
                            >
                                <div class="flex flex-nowrap items-center font-mono text-white">
                                    <span class="truncate">
                                        {props.info.txid}
                                    </span>
                                    <span>
                                        {props.info.txid.length > 32
                                            ? props.info.txid.slice(-8)
                                            : ""}
                                    </span>
                                    <svg
                                        class="inline-block w-[16px] overflow-visible pl-0.5 text-white"
                                        width="16"
                                        height="16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M6.00002 3.33337v1.33334H10.39L2.66669 12.39l.94333.9434 7.72338-7.72336V10h1.3333V3.33337H6.00002Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </div>
                            </a>
                        </div>
                        <button
                            class="min-w-[1.5rem] p-1"
                            classList={{ "bg-m-green rounded": copied() }}
                            onClick={() => copy(props.info.txid)}
                        >
                            <Copy class="h-4 w-4" />
                        </button>
                    </div>
                </KeyValue>
            </ul>
        </VStack>
    );
}

function ChannelCloseDetails(props: { info: ChannelClosure }) {
    const i18n = useI18n();
    return (
        <VStack>
            {/* <pre>{JSON.stringify(props.info.value, null, 2)}</pre> */}
            <ul class="flex flex-col gap-4">
                <InfoBox accent="blue">
                    <p>{i18n.t("activity.transaction_details.sweep_delay")}</p>
                </InfoBox>
                <KeyValue
                    key={i18n.t("activity.transaction_details.channel_id")}
                >
                    <MiniStringShower text={props.info.channel_id ?? ""} />
                </KeyValue>
                <Show when={props.info.timestamp}>
                    <KeyValue key={i18n.t("activity.transaction_details.date")}>
                        {props.info.timestamp ? (
                            <FormatPrettyPrint
                                ts={Number(props.info.timestamp)}
                            />
                        ) : (
                            i18n.t("common.pending")
                        )}
                    </KeyValue>
                </Show>
                <KeyValue key={i18n.t("activity.transaction_details.reason")}>
                    <p class="whitespace-normal text-right text-neutral-300">
                        {props.info.reason ?? ""}
                    </p>
                </KeyValue>
            </ul>
        </VStack>
    );
}

export function ActivityDetailsModal(props: {
    open: boolean;
    kind?: HackActivityType;
    id: string;
    setOpen: (open: boolean) => void;
}) {
    const [state, _actions] = useMegaStore();
    const id = () => props.id;
    const kind = () => props.kind;

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
        if (
            !!data() &&
            data()?.labels !== undefined &&
            typeof data()?.labels[0] === "string"
        ) {
            try {
                // find if there's just one for now
                const tags = state.mutiny_wallet?.get_tag_item(
                    data().labels[0]
                );
                if (tags) {
                    return tags;
                } else {
                    return;
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            return;
        }
    });

    createEffect(() => {
        if (props.id && props.kind && props.open) {
            refetch();
        }
    });

    return (
        <Dialog.Root open={props.open} onOpenChange={props.setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay class={OVERLAY} />
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT}>
                        <Suspense>
                            <div class="p-4">
                                <div class="flex justify-between">
                                    <div />
                                    <Dialog.CloseButton>
                                        <ModalCloseButton />
                                    </Dialog.CloseButton>
                                </div>
                                <Dialog.Title>
                                    <FancyCard>
                                        <Show when={data.latest}>
                                            <Switch>
                                                <Match
                                                    when={
                                                        kind() === "Lightning"
                                                    }
                                                >
                                                    <LightningHeader
                                                        info={
                                                            data() as MutinyInvoice
                                                        }
                                                    />
                                                </Match>
                                                <Match
                                                    when={
                                                        kind() === "OnChain" ||
                                                        kind() ===
                                                            "ChannelOpen" ||
                                                        kind() ===
                                                            "ChannelClose"
                                                    }
                                                >
                                                    <OnchainHeader
                                                        info={
                                                            data() as OnChainTx
                                                        }
                                                        kind={kind()}
                                                    />
                                                </Match>
                                            </Switch>
                                        </Show>
                                    </FancyCard>
                                </Dialog.Title>
                                <Hr />
                                <Show when={data.latest}>
                                    <Switch>
                                        <Match when={kind() === "Lightning"}>
                                            <LightningDetails
                                                info={data() as MutinyInvoice}
                                                tags={tags()}
                                            />
                                        </Match>
                                        <Match
                                            when={
                                                kind() === "OnChain" ||
                                                kind() === "ChannelOpen"
                                            }
                                        >
                                            <OnchainDetails
                                                info={data() as OnChainTx}
                                                kind={kind()}
                                                tags={tags()}
                                            />
                                        </Match>
                                        <Match when={kind() === "ChannelClose"}>
                                            <ChannelCloseDetails
                                                info={data() as ChannelClosure}
                                            />
                                        </Match>
                                    </Switch>
                                </Show>
                            </div>
                        </Suspense>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
