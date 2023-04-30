import { Component, createEffect, createMemo, createResource, createSignal, For, Match, onMount, ParentComponent, Show, Suspense, Switch } from "solid-js";
import { CENTER_COLUMN, MISSING_LABEL, REDSHIFT_LABEL, RIGHT_COLUMN, THREE_COLUMNS, UtxoItem } from "~/components/Activity";
import { Card, DefaultMain, LargeHeader, LoadingSpinner, NiceP, NodeManagerGuard, SafeArea, SmallAmount, SmallHeader, VStack } from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import { StyledRadioGroup } from "~/components/layout/Radio";
import NavBar from "~/components/NavBar";
import { useMegaStore } from "~/state/megaStore";
import wave from "~/assets/wave.gif"
import utxoIcon from '~/assets/icons/coin.svg';
import { Button } from "~/components/layout/Button";
import { ProgressBar } from "~/components/layout/ProgressBar";
import { MutinyChannel } from "@mutinywallet/mutiny-wasm";
import mempoolTxUrl from "~/utils/mempoolTxUrl";
import { Amount } from "~/components/Amount";


type ShiftOption = "utxo" | "lightning"

type ShiftStage = "choose" | "observe" | "success" | "failure"


type OutPoint = string; // Replace with the actual TypeScript type for OutPoint
type RedshiftStatus = any; // Replace with the actual TypeScript type for RedshiftStatus
type RedshiftRecipient = any; // Replace with the actual TypeScript type for RedshiftRecipient
type PublicKey = any; // Replace with the actual TypeScript type for PublicKey

interface RedshiftResult {
    id: bigint;
    input_utxo: OutPoint;
    status: RedshiftStatus;
    recipient: RedshiftRecipient;
    output_utxo?: OutPoint;
    introduction_channel?: OutPoint;
    output_channel?: OutPoint;
    introduction_node: PublicKey;
    amount_sats: bigint;
    change_amt?: bigint;
    fees_paid: bigint;
}

const dummyRedshift: RedshiftResult = {
    id: BigInt(1),
    input_utxo: "44036599c37d590899e8d5d92086028695d2c2966fdc354ce1da9a9eac610a53:1",
    status: {}, // Replace with a dummy value for RedshiftStatus
    recipient: {}, // Replace with a dummy value for RedshiftRecipient
    output_utxo: "44036599c37d590899e8d5d92086028695d2c2966fdc354ce1da9a9eac610a53:1",
    introduction_channel: "a7773e57f8595848a635e9af105927cac9ecaf292d71a76456ae0455bd3c9c64:0",
    output_channel: "a7773e57f8595848a635e9af105927cac9ecaf292d71a76456ae0455bd3c9c64:0",
    introduction_node: {}, // Replace with a dummy value for PublicKey
    amount_sats: BigInt(1000000),
    change_amt: BigInt(12345),
    fees_paid: BigInt(2500),
};

function RedshiftReport(props: { redshift: RedshiftResult }) {
    const [state, _actions] = useMegaStore();

    const getUtXos = async () => {
        console.log("Getting utxos");
        return await state.node_manager?.list_utxos() as UtxoItem[];
    }

    function findUtxoByOutpoint(outpoint?: string, utxos: UtxoItem[] = []): UtxoItem | undefined {
        if (!outpoint) return undefined;
        return utxos.find((utxo) => utxo.outpoint === outpoint);
    }

    const [utxos, { refetch: _refetchUtxos }] = createResource(getUtXos);
    //     <VStack>

    //     {/* {JSON.stringify(props.channel, null, 2)} */}
    //     <Amount amountSats={props.channel.size} />
    //     <KV key={"Peer"} value={props.channel.peer} />
    //     <KV key={"Outpoint"} value={props.channel.outpoint} />
    //     {/* TODO: don't hardcode this */}
    //     <a class="" href={mempoolTxUrl(props.channel.outpoint?.split(":")[0], "signet")} target="_blank" rel="noreferrer">
    //         View on mempool
    //     </a>
    // </VStack>

    const inputUtxo = createMemo(() => {
        console.log(utxos())
        const foundUtxo = findUtxoByOutpoint(props.redshift.input_utxo, utxos())
        console.log("Found utxo:", foundUtxo)
        return foundUtxo
    })

    const outputUtxo = createMemo(() => {
        return findUtxoByOutpoint(props.redshift.output_utxo, utxos())
    })

    return (
        <VStack biggap>

            <VStack>
                <NiceP>We did it. Here's your new UTXO:</NiceP>
                <Show when={utxos() && outputUtxo()}>
                    <Card>
                        <Utxo item={outputUtxo()!} redshifted />
                    </Card>
                </Show>
            </VStack>
            <VStack>
                <NiceP>What happened?</NiceP>
                <Card>
                    <VStack biggap>
                        <KV key="Input utxo">
                            <Show when={utxos() && inputUtxo()}>
                                <Utxo item={inputUtxo()!} />
                            </Show>
                        </KV>
                        <KV key="Starting amount">
                            <Amount amountSats={props.redshift.amount_sats} />
                        </KV>
                        <KV key="Fees paid">
                            <Amount amountSats={props.redshift.fees_paid} />
                        </KV>
                        <KV key="Change">
                            <Amount amountSats={props.redshift.change_amt} />
                        </KV>
                        <KV key="Outbound channel">
                            <VStack>
                                <pre class="whitespace-pre-wrap break-all">{props.redshift.introduction_channel}</pre>
                                <a class="" href={mempoolTxUrl(props.redshift.introduction_channel?.split(":")[0], "signet")} target="_blank" rel="noreferrer">
                                    View on mempool
                                </a>
                            </VStack>
                        </KV>
                        <KV key="Return channel">
                            <VStack>
                                <pre class="whitespace-pre-wrap break-all">{props.redshift.output_channel}</pre>
                                <a class="" href={mempoolTxUrl(props.redshift.output_channel?.split(":")[0], "signet")} target="_blank" rel="noreferrer">
                                    View on mempool
                                </a>

                            </VStack>
                        </KV>
                    </VStack>
                </Card>
                <SmallHeader></SmallHeader>
            </VStack>
        </VStack>
    )
}

const SHIFT_OPTIONS = [{ value: "utxo", label: "UTXO", caption: "Trade your UTXO for a fresh UTXO" }, { value: "lightning", label: "Lightning", caption: "Convert your UTXO into Lightning" }]

export function Utxo(props: { item: UtxoItem, onClick?: () => void, redshifted?: boolean }) {
    const spent = createMemo(() => props.item.is_spent);
    return (
        <>
            <div class={THREE_COLUMNS} onClick={props.onClick}>
                <div class="flex items-center">
                    <img src={utxoIcon} alt="coin" />
                </div>
                <div class={CENTER_COLUMN}>
                    <div class="flex gap-2">
                        <Show when={props.redshifted} fallback={<h2 class={MISSING_LABEL}>Unknown</h2>}>
                            <h2 class={REDSHIFT_LABEL}>Redshift</h2>
                        </Show>
                    </div>
                    <SmallAmount amount={props.item.txout.value} />
                </div>
                <div class={RIGHT_COLUMN}>
                    <SmallHeader class={props.item?.is_spent ? "text-m-red" : "text-m-green"}>
                        {/* {props.item?.is_spent ? "SPENT" : "UNSPENT"} */}
                    </SmallHeader>
                </div>
            </div>
        </>
    )
}

const FAKE_STATES = ["Creating a new node", "Opening a channel", "Sending funds through", "Closing the channel", "Redshift complete"]

function ShiftObserver(props: { setShiftStage: (stage: ShiftStage) => void }, utxo: UtxoItem) {
    const [fakeStage, setFakeStage] = createSignal(2);

    const [sentAmount, setSentAmount] = createSignal(0);

    onMount(() => {
        const interval = setInterval(() => {
            if (sentAmount() === 200000) {
                clearInterval(interval)
                props.setShiftStage("success");
                // setSentAmount((0))

            } else {
                setSentAmount((sentAmount() + 50000))
            }
        }, 1000)
    })

    return (
        <>
            <NiceP>Watch it go!</NiceP>
            <Card>
                <VStack>
                    <pre class="self-center">{FAKE_STATES[fakeStage()]}</pre>
                    <ProgressBar value={sentAmount()} max={200000} />
                    <img src={wave} class="h-4 self-center" alt="sine wave" />
                </VStack>
            </Card>
        </>
    )
}

const KV: ParentComponent<{ key: string }> = (props) => {
    return (
        <div class="flex flex-col gap-2">
            <p class="text-sm font-semibold uppercase">{props.key}</p>
            {props.children}
        </div>
    )
}

const KVPre: ParentComponent<{ key: string }> = (props) => {
    return (
        <div class="flex flex-col gap-2">
            <p class="text-sm font-semibold uppercase">{props.key}</p>
            <pre class="whitespace-pre-wrap break-all">
                {props.children}
            </pre>
        </div>
    )
}

function SingleChannel(props: { channel: MutinyChannel }) {
    return (
        <VStack>

            {/* {JSON.stringify(props.channel, null, 2)} */}
            <Amount amountSats={props.channel.size} />
            <KV key={"Peer"}>{props.channel.peer}</KV>
            <KV key={"Outpoint"}>{props.channel.outpoint}</KV>
            {/* TODO: don't hardcode this */}
            <a class="" href={mempoolTxUrl(props.channel.outpoint?.split(":")[0], "signet")} target="_blank" rel="noreferrer">
                View on mempool
            </a>
        </VStack>
    )
}


export default function Redshift() {
    const [state, _actions] = useMegaStore();

    const [shiftStage, setShiftStage] = createSignal<ShiftStage>("choose");
    const [shiftType, setShiftType] = createSignal<ShiftOption>("utxo");

    const [chosenUtxo, setChosenUtxo] = createSignal<UtxoItem>();

    const getUtXos = async () => {
        console.log("Getting utxos");
        return await state.node_manager?.list_utxos() as UtxoItem[];
    }

    const getChannels = async () => {
        console.log("Getting channels");
        await state.node_manager?.sync()
        const channels = await state.node_manager?.list_channels() as Promise<MutinyChannel[]>;
        console.log(channels)
        return channels

    }

    const [utxos, { refetch: _refetchUtxos }] = createResource(getUtXos);
    const [channels, { refetch: _refetchChannels }] = createResource(getChannels);

    createEffect(() => {
        if (chosenUtxo()) {
            setShiftStage("observe");
        }
    })

    function resetState() {
        setShiftStage("choose");
        setShiftType("utxo");
        setChosenUtxo(undefined);
    }

    return (
        <NodeManagerGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink />
                    <LargeHeader>Redshift</LargeHeader>
                    <VStack biggap>
                        <Switch>
                            <Match when={shiftStage() === "choose"}>
                                <VStack>
                                    <NiceP>Where is this going?</NiceP>
                                    <StyledRadioGroup red value={shiftType()} onValueChange={(newValue) => setShiftType(newValue as ShiftOption)} choices={SHIFT_OPTIONS} />
                                </VStack>
                                <VStack>
                                    <NiceP>Choose your <span class="inline-block"><img class="h-4" src={wave} alt="sine wave" /></span> UTXO to begin</NiceP>
                                    <Suspense>
                                        <Card title="Unshifted UTXOs">
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
                                                            <Utxo item={utxo} onClick={() => setChosenUtxo(utxo)} />
                                                        }
                                                    </For>
                                                </Match>
                                            </Switch>
                                        </Card>
                                    </Suspense>
                                    <Suspense>
                                        <Card titleElement={<SmallHeader><span class="text-m-red">Redshifted </span>UTXOs</SmallHeader>}>
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
                                                            <Utxo redshifted item={utxo} />
                                                        }
                                                    </For>
                                                </Match>
                                            </Switch>
                                        </Card>
                                    </Suspense>
                                </VStack>
                            </Match>
                            <Match when={shiftStage() === "observe"}>
                                <ShiftObserver setShiftStage={setShiftStage} />
                            </Match>
                            <Match when={shiftStage() === "success"}>
                                <VStack biggap>
                                    <RedshiftReport redshift={dummyRedshift} />
                                    <Button intent="red" onClick={resetState}>Nice</Button>
                                </VStack>
                            </Match>
                            <Match when={shiftStage() === "failure"}>
                                <NiceP>Oh dear</NiceP>
                                <NiceP>Here's what happened:</NiceP>
                                <Button intent="red" onClick={resetState}>Dangit</Button>
                            </Match>
                        </Switch>
                    </VStack>
                </DefaultMain>
                <NavBar activeTab="redshift" />
            </SafeArea>
        </NodeManagerGuard>
    )
}