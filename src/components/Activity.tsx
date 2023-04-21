import send from '~/assets/icons/send.svg';
import receive from '~/assets/icons/receive.svg';
import { Card, LoadingSpinner, SmallAmount, SmallHeader, VStack } from './layout';
import { For, Match, ParentComponent, Suspense, Switch, createMemo, createResource, createSignal } from 'solid-js';
import { useMegaStore } from '~/state/megaStore';
import { MutinyInvoice } from '@mutinywallet/mutiny-wasm';
import { prettyPrintTime } from '~/utils/prettyPrintTime';
import { JsonModal } from '~/components/JsonModal';
import mempoolTxUrl from '~/utils/mempoolTxUrl';

const THREE_COLUMNS = 'grid grid-cols-[auto,1fr,auto] gap-4 py-2 px-2 border-b border-neutral-800 last:border-b-0'
const CENTER_COLUMN = 'min-w-0 overflow-hidden max-w-full'
const MISSING_LABEL = 'py-1 px-2 bg-m-red rounded inline-block text-sm'
const RIGHT_COLUMN = 'flex flex-col items-right text-right'

type OnChainTx = {
    txid: string
    received: number
    sent: number
    fee?: number
    confirmation_time?: {
        height: number
        timestamp: number
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
                {isReceive() ? <img src={receive} alt="receive arrow" /> : <img src={send} alt="send arrow" />}
                <div class={CENTER_COLUMN}>
                    <h2 class={MISSING_LABEL}>Label Missing</h2>
                    {isReceive() ? <SmallAmount amount={props.item.received} /> : <SmallAmount amount={props.item.sent} />}
                    {/* <h2 class="truncate">Txid: {props.item.txid}</h2> */}
                </div>
                <div class={RIGHT_COLUMN}>
                    <SmallHeader class={isReceive() ? "text-m-green" : "text-m-red"}>
                        {isReceive() ? "RECEIVE" : "SEND"}
                    </SmallHeader>
                    <SubtleText>{props.item.confirmation_time ? prettyPrintTime(props.item.confirmation_time.timestamp) : "Unconfirmed"}</SubtleText>
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
                {isSend() ? <img src={send} alt="send arrow" /> : <img src={receive} alt="receive arrow" />}
                <div class={CENTER_COLUMN}>
                    <h2 class={MISSING_LABEL}>Label Missing</h2>
                    <SmallAmount amount={props.item.amount_sats || 0} />
                </div>
                <div class={RIGHT_COLUMN}>
                    <SmallHeader class={isSend() ? "text-m-red" : "text-m-green"}>
                        {isSend() ? "SEND" : "RECEIVE"}
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
                    <h2 class={MISSING_LABEL}>Label Missing</h2>
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
                            <LoadingSpinner big />
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
                            <LoadingSpinner big />
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
                            <LoadingSpinner big />
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