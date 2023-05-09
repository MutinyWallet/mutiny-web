import send from '~/assets/icons/send.svg';
import receive from '~/assets/icons/receive.svg';
import { Card, LoadingSpinner, NiceP, SmallAmount, SmallHeader, VStack } from './layout';
import { For, Match, ParentComponent, Suspense, Switch, createMemo, createResource, createSignal } from 'solid-js';
import { useMegaStore } from '~/state/megaStore';
import { MutinyInvoice } from '@mutinywallet/mutiny-wasm';
import { prettyPrintTime } from '~/utils/prettyPrintTime';
import { JsonModal } from '~/components/JsonModal';
import mempoolTxUrl from '~/utils/mempoolTxUrl';

export const THREE_COLUMNS = 'grid grid-cols-[auto,1fr,auto] gap-4 py-2 px-2 border-b border-neutral-800 last:border-b-0'
export const CENTER_COLUMN = 'min-w-0 overflow-hidden max-w-full'
export const MISSING_LABEL = 'py-1 px-2 bg-white/10 rounded inline-block text-sm'
export const RIGHT_COLUMN = 'flex flex-col items-right text-right max-w-[9rem]'

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
    }
}

type Utxo = {
    outpoint: string
    txout: {
        value: number
        script_pubkey: string
    }
    keychain: string
    is_spent: boolean
}

const SubtleText: ParentComponent = (props) => {
    return <h3 class='text-xs text-gray-500 uppercase'>{props.children}</h3>
}

function OnChainItem(props: { item: OnChainTx }) {
    const isReceive = createMemo(() => props.item.received > 0);

    const [open, setOpen] = createSignal(false)

    return (
        <>
            <JsonModal open={open()} data={props.item} title="On-Chain Transaction" setOpen={setOpen}>
                <a href={mempoolTxUrl(props.item.txid, "signet")} target="_blank" rel="noreferrer">
                    Mempool Link
                </a>
            </JsonModal>
            <div class={THREE_COLUMNS} onClick={() => setOpen(!open())}>
                <div class="flex items-center">
                    {isReceive() ? <img src={receive} alt="receive arrow" /> : <img src={send} alt="send arrow" />}
                </div>
                <div class={CENTER_COLUMN}>
                    <h2 class={MISSING_LABEL}>Unknown</h2>
                    {isReceive() ? <SmallAmount amount={props.item.received} sign="+" /> : <SmallAmount amount={props.item.sent} />}
                    {/* <h2 class="truncate">Txid: {props.item.txid}</h2> */}
                </div>
                <div class={RIGHT_COLUMN}>
                    <SmallHeader>
                        <span class="text-neutral-500">On-chain</span>&nbsp;{isReceive() ? <span class="text-m-green">Receive</span> : <span class="text-m-red">Send</span>}
                    </SmallHeader>
                    <SubtleText>{props.item.confirmation_time?.Confirmed ? prettyPrintTime(props.item.confirmation_time?.Confirmed?.time) : "Unconfirmed"}</SubtleText>
                </div>
            </div>
        </>
    )
}

function InvoiceItem(props: { item: MutinyInvoice }) {
    const isSend = createMemo(() => props.item.is_send);

    const [open, setOpen] = createSignal(false)

    return (
        <>
            <JsonModal open={open()} data={props.item} title="Lightning Transaction" setOpen={setOpen} />
            <div class={THREE_COLUMNS} onClick={() => setOpen(!open())}>
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
            </div >
        </>
    )
}

function Utxo(props: { item: Utxo }) {
    const spent = createMemo(() => props.item.is_spent);

    const [open, setOpen] = createSignal(false)

    return (
        <>
            <JsonModal open={open()} data={props.item} title="Unspent Transaction Output" setOpen={setOpen} />
            <div class={THREE_COLUMNS} onClick={() => setOpen(!open())}>
                <img src={receive} alt="receive arrow" />
                <div class={CENTER_COLUMN}>
                    <h2 class={MISSING_LABEL}>Unknown</h2>
                    <SmallAmount amount={props.item.txout.value} />
                </div>
                <div class={RIGHT_COLUMN}>
                    <SmallHeader class={spent() ? "text-m-red" : "text-m-green"}>
                        {spent() ? "SPENT" : "UNSPENT"}
                    </SmallHeader>
                </div>
            </div>
        </>
    )
}

export function Activity() {
    const [state, _] = useMegaStore();

    const getTransactions = async () => {
        console.log("Getting onchain txs");
        const txs = await state.node_manager?.list_onchain() as OnChainTx[];
        return txs.reverse();
    }

    const getInvoices = async () => {
        console.log("Getting invoices");
        const invoices = await state.node_manager?.list_invoices() as MutinyInvoice[];
        return invoices.filter((inv) => inv.paid).reverse();
    }

    const getUtXos = async () => {
        console.log("Getting utxos");
        const utxos = await state.node_manager?.list_utxos() as Utxo[];
        return utxos;
    }

    const [transactions, { refetch: _refetchTransactions }] = createResource(getTransactions);
    const [invoices, { refetch: _refetchInvoices }] = createResource(getInvoices);
    const [utxos, { refetch: _refetchUtxos }] = createResource(getUtXos);

    return (
        <VStack>
            <Suspense>
                <Card title="On-chain">
                    <Switch>
                        <Match when={transactions.loading}>
                            <LoadingSpinner wide />
                        </Match>
                        <Match when={transactions.state === "ready" && transactions().length === 0}>
                            <code>No transactions (empty state)</code>
                        </Match>
                        <Match when={transactions.state === "ready" && transactions().length >= 0}>
                            <For each={transactions()}>
                                {(tx) =>
                                    <OnChainItem item={tx} />
                                }
                            </For>
                        </Match>
                    </Switch>
                </Card>
                <Card title="Lightning">
                    <Switch>
                        <Match when={invoices.loading}>
                            <LoadingSpinner wide />
                        </Match>
                        <Match when={invoices.state === "ready" && invoices().length === 0}>
                            <code>No invoices (empty state)</code>
                        </Match>
                        <Match when={invoices.state === "ready" && invoices().length >= 0}>
                            <For each={invoices()}>
                                {(invoice) =>
                                    <InvoiceItem item={invoice} />
                                }
                            </For>
                        </Match>
                    </Switch>
                </Card>
                <Card title="UTXOs">
                    <Switch>
                        <Match when={utxos.loading}>
                            <LoadingSpinner wide />
                        </Match>
                        <Match when={utxos.state === "ready" && utxos().length === 0}>
                            <code>No utxos (empty state)</code>
                        </Match>
                        <Match when={utxos.state === "ready" && utxos().length >= 0}>
                            <For each={utxos()}>
                                {(utxo) =>
                                    <Utxo item={utxo} />
                                }
                            </For>
                        </Match>
                    </Switch>
                </Card>
            </Suspense>
        </VStack>
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
        const txs = await state.node_manager?.list_onchain() as OnChainTx[];
        const invoices = await state.node_manager?.list_invoices() as MutinyInvoice[];

        const activity: ActivityItem[] = [];

        txs.forEach((tx) => {
            activity.push({ type: "onchain", item: tx, time: tx.confirmation_time?.Confirmed?.time || Date.now() })
        })

        invoices.forEach((invoice) => {
            activity.push({ type: "lightning", item: invoice, time: Number(invoice.expire) })
        })

        if (props.limit) {
            return activity.sort(sortByTime).slice(0, props.limit);
        } else {
            return activity.sort(sortByTime);
        }
    }

    const [activity] = createResource(getAllActivity);

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
                                <OnChainItem item={activityItem.item as OnChainTx} />
                            </Match>
                            <Match when={activityItem.type === "lightning"}>
                                <InvoiceItem item={activityItem.item as MutinyInvoice} />
                            </Match>
                        </Switch>
                    }
                </For>
            </Match>
        </Switch>

    )


}