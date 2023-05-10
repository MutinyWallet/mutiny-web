import send from '~/assets/icons/send.svg';
import receive from '~/assets/icons/receive.svg';
import { ButtonLink, Card, LoadingSpinner, NiceP, SmallAmount, SmallHeader, VStack } from './layout';
import { For, Match, ParentComponent, Show, Suspense, Switch, createMemo, createResource, createSignal } from 'solid-js';
import { useMegaStore } from '~/state/megaStore';
import { MutinyInvoice } from '@mutinywallet/mutiny-wasm';
import { prettyPrintTime } from '~/utils/prettyPrintTime';
import { JsonModal } from '~/components/JsonModal';
import mempoolTxUrl from '~/utils/mempoolTxUrl';
import wave from "~/assets/wave.gif"
import utxoIcon from '~/assets/icons/coin.svg';
import { getRedshifted } from '~/utils/fakeLabels';
import { ActivityItem } from './ActivityItem';

export const THREE_COLUMNS = 'grid grid-cols-[auto,1fr,auto] gap-4 py-2 px-2 border-b border-neutral-800 last:border-b-0'
export const CENTER_COLUMN = 'min-w-0 overflow-hidden max-w-full'
export const MISSING_LABEL = 'py-1 px-2 bg-white/10 rounded inline-block text-sm'
export const REDSHIFT_LABEL = 'py-1 px-2 bg-white text-m-red rounded inline-block text-sm'
export const RIGHT_COLUMN = 'flex flex-col items-right text-right max-w-[8rem]'

export type OnChainTx = {
    txid: string
    received: number
    sent: number
    fee?: number
    confirmation_time?: {
        "Confirmed"?: {
            height: number
            time: number
        }
    },
    labels: string[]
}

export type UtxoItem = {
    outpoint: string
    txout: {
        value: number
        script_pubkey: string
    }
    keychain: string
    is_spent: boolean,
    redshifted?: boolean
}

const SubtleText: ParentComponent = (props) => {
    return <h3 class='text-xs text-gray-500 uppercase'>{props.children}</h3>
}

function OnChainItem(props: { item: OnChainTx, labels: string[] }) {
    const [store, actions] = useMegaStore();
    const isReceive = createMemo(() => props.item.received > 0);

    const [open, setOpen] = createSignal(false)

    return (
        <>
            <JsonModal open={open()} data={props.item} title="On-Chain Transaction" setOpen={setOpen}>
                <a href={mempoolTxUrl(props.item.txid, "signet")} target="_blank" rel="noreferrer">
                    Mempool Link
                </a>
            </JsonModal>
            {/* {JSON.stringify(props.labels)} */}
            <ActivityItem
                kind={"onchain"}
                labels={props.labels}
                amount={isReceive() ? props.item.received : props.item.sent}
                date={props.item.confirmation_time?.Confirmed?.time}
                positive={isReceive()}
                onClick={() => setOpen(!open())}
            />
            {/* <div class={THREE_COLUMNS} onClick={() => setOpen(!open())}>
                <div class="flex items-center">
                    {isReceive() ? <img src={receive} alt="receive arrow" /> : <img src={send} alt="send arrow" />}
                </div>
                <div class={CENTER_COLUMN}>
                    <h2 class={MISSING_LABEL}>Unknown</h2>
                    {isReceive() ? <SmallAmount amount={props.item.received} /> : <SmallAmount amount={props.item.sent} />}
                </div>
                <div class={RIGHT_COLUMN}>
                    <SmallHeader>
                        <span class="text-neutral-500">On-chain</span>&nbsp;{isReceive() ? <span class="text-m-green">Receive</span> : <span class="text-m-red">Send</span>}
                    </SmallHeader>
                    <SubtleText>{props.item.confirmation_time?.Confirmed ? prettyPrintTime(props.item.confirmation_time?.Confirmed?.time) : "Unconfirmed"}</SubtleText>
                </div>
            </div> */}
        </>
    )
}

function InvoiceItem(props: { item: MutinyInvoice, labels: string[] }) {
    const [store, actions] = useMegaStore();
    const isSend = createMemo(() => props.item.is_send);

    const [open, setOpen] = createSignal(false)

    return (
        <>
            <JsonModal open={open()} data={props.item} title="Lightning Transaction" setOpen={setOpen} />
            <ActivityItem kind={"lightning"} labels={props.labels} amount={props.item.amount_sats || 0n} date={props.item.last_updated} positive={!isSend()} onClick={() => setOpen(!open())} />
            {/* <div class={THREE_COLUMNS} onClick={() => setOpen(!open())}>
                <div class="flex items-center">
                    {isSend() ? <img src={send} alt="send arrow" /> : <img src={receive} alt="receive arrow" />}
                </div>
                <div class={CENTER_COLUMN}>
                    <h2 class={MISSING_LABEL}>Unknown</h2>
                    <SmallAmount amount={props.item.amount_sats || 0} />
                </div>
                <div class={RIGHT_COLUMN}>
                    <SmallHeader>
                        <span class="text-neutral-500">Lightning</span>&nbsp;{!isSend() ? <span class="text-m-green">Receive</span> : <span class="text-m-red">Send</span>}
                    </SmallHeader>
                    <SubtleText>{prettyPrintTime(Number(props.item.expire))}</SubtleText>
                </div>
            </div > */}
        </>
    )
}

function Utxo(props: { item: UtxoItem }) {
    const spent = createMemo(() => props.item.is_spent);

    const [open, setOpen] = createSignal(false)

    const redshifted = createMemo(() => getRedshifted(props.item.outpoint));

    return (
        <>
            <JsonModal open={open()} data={props.item} title="Unspent Transaction Output" setOpen={setOpen} />
            <div class={THREE_COLUMNS} onClick={() => setOpen(!open())}>
                <div class="flex items-center">
                    <img src={utxoIcon} alt="coin" />
                </div>
                <div class={CENTER_COLUMN}>
                    <div class="flex gap-2">
                        <Show when={redshifted()} fallback={<h2 class={MISSING_LABEL}>Unknown</h2>}>
                            <h2 class={REDSHIFT_LABEL}>Redshift</h2>
                        </Show>
                    </div>
                    <SmallAmount amount={props.item.txout.value} />
                </div>
                <div class={RIGHT_COLUMN}>
                    <SmallHeader class={spent() ? "text-m-red" : "text-m-green"}>
                        {/* {spent() ? "SPENT" : "UNSPENT"} */}
                    </SmallHeader>
                </div>
            </div>
        </>
    )
}

type ActivityItem = { type: "onchain" | "lightning", item: OnChainTx | MutinyInvoice, time: number }

function sortByTime(a: ActivityItem, b: ActivityItem) {
    return b.time - a.time;
}

export function CombinedActivity(props: { limit?: number }) {

    const [state, _] = useMegaStore();

    const getAllActivity = async () => {
        console.log("Getting all activity");
        const txs = await state.mutiny_wallet?.list_onchain() as OnChainTx[];
        const invoices = await state.mutiny_wallet?.list_invoices() as MutinyInvoice[];

        const activity: ActivityItem[] = [];

        txs.forEach((tx) => {
            activity.push({ type: "onchain", item: tx, time: tx.confirmation_time?.Confirmed?.time || Date.now() })
        })

        invoices.forEach((invoice) => {
            if (invoice.paid) {
                activity.push({ type: "lightning", item: invoice, time: Number(invoice.expire) })
            }
        })

        if (props.limit) {
            return activity.sort(sortByTime).slice(0, props.limit);
        } else {
            return activity.sort(sortByTime);
        }
    }

    const [activity] = createResource(getAllActivity);

    // const addressLabels = createMemo(() => {
    //     const labels = state.mutiny_wallet?.get_address_labels();
    //     console.log(labels);
    //     return labels || [];
    //     // return labels.filter((label) => label.address === props.item.txid)
    // })

    // const invoiceLabels = createMemo(() => {
    //     const labels = state.mutiny_wallet?.get_address_labels();
    //     console.log(labels);
    //     if (!labels) return ["abcdefg"];
    //     return labels;
    //     // return labels.filter((label) => label.address === props.item.txid)
    // })

    return (
        <Switch>
            <Match when={activity.loading}>
                <LoadingSpinner wide />
            </Match>
            <Match when={activity.state === "ready" && activity().length === 0}>
                <NiceP>No activity to show</NiceP>
            </Match>
            <Match when={activity.state === "ready" && activity().length >= 0}>
                <For each={activity()}>
                    {(activityItem) =>
                        <Switch>
                            <Match when={activityItem.type === "onchain"}>
                                {/* FIXME */}
                                <OnChainItem item={activityItem.item as OnChainTx} labels={activityItem.item.labels} />
                            </Match>
                            <Match when={activityItem.type === "lightning"}>
                                {/* FIXME */}
                                <InvoiceItem item={activityItem.item as MutinyInvoice} labels={activityItem.item.labels} />
                            </Match>
                        </Switch>
                    }
                </For>
            </Match>
        </Switch>

    )


}