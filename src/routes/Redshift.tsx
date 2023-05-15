import { Component, createEffect, createMemo, createResource, createSignal, For, Match, onCleanup, onMount, ParentComponent, Show, Suspense, Switch } from "solid-js";
import { CENTER_COLUMN, MISSING_LABEL, REDSHIFT_LABEL, RIGHT_COLUMN, THREE_COLUMNS, UtxoItem } from "~/components/Activity";
import { Card, DefaultMain, LargeHeader, LoadingSpinner, NiceP, MutinyWalletGuard, SafeArea, SmallAmount, SmallHeader, VStack } from "~/components/layout";
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
import { getRedshifted, setRedshifted } from "~/utils/fakeLabels";
import { Network } from "~/logic/mutinyWalletSetup";

type ShiftOption = "utxo" | "lightning"

type ShiftStage = "choose" | "observe" | "success" | "failure"

type OutPoint = string; // Replace with the actual TypeScript type for OutPoint
type RedshiftStatus = string; // Replace with the actual TypeScript type for RedshiftStatus
type RedshiftRecipient = any; // Replace with the actual TypeScript type for RedshiftRecipient
type PublicKey = any; // Replace with the actual TypeScript type for PublicKey

interface RedshiftResult {
    id: string;
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
    id: "44036599c37d590899e8d5d920860286",
    input_utxo: "44036599c37d590899e8d5d92086028695d2c2966fdc354ce1da9a9eac610a53:1",
    status: "Completed", // Replace with a dummy value for RedshiftStatus
    recipient: {}, // Replace with a dummy value for RedshiftRecipient
    output_utxo: "44036599c37d590899e8d5d92086028695d2c2966fdc354ce1da9a9eac610a53:1",
    introduction_channel: "a7773e57f8595848a635e9af105927cac9ecaf292d71a76456ae0455bd3c9c64:0",
    output_channel: "a7773e57f8595848a635e9af105927cac9ecaf292d71a76456ae0455bd3c9c64:0",
    introduction_node: {}, // Replace with a dummy value for PublicKey
    amount_sats: BigInt(1000000),
    change_amt: BigInt(12345),
    fees_paid: BigInt(2500),
};

function RedshiftReport(props: { redshift: RedshiftResult, utxo: UtxoItem }) {
    const [state, _actions] = useMegaStore();

    const getUtXos = async () => {
        console.log("Getting utxos");
        return await state.mutiny_wallet?.list_utxos() as UtxoItem[];
    }

    function findUtxoByOutpoint(outpoint?: string, utxos: UtxoItem[] = []): UtxoItem | undefined {
        if (!outpoint) return undefined;
        return utxos.find((utxo) => utxo.outpoint === outpoint);
    }


    const [utxos, { refetch: _refetchUtxos }] = createResource(getUtXos);

    const inputUtxo = createMemo(() => {
        console.log(utxos())
        const foundUtxo = findUtxoByOutpoint(props.redshift.input_utxo, utxos())
        console.log("Found utxo:", foundUtxo)
        return foundUtxo
    })


    async function checkRedshift(id: string) {
        // const rs = redshiftItems[0] as RedshiftResult;
        console.log("Checking redshift", id)
        const redshift = await state.mutiny_wallet?.get_redshift(id);
        console.log(redshift)
        return redshift;
    }

    const [redshiftResource, { refetch }] = createResource(props.redshift.id, checkRedshift);
    onMount(() => {
        const interval = setInterval(() => {
            if (redshiftResource()) refetch();
            // if (sentAmount() === 200000) {
            //     clearInterval(interval)
            //     props.setShiftStage("success");
            //     // setSentAmount((0))

            // } else {
            //     setSentAmount((sentAmount() + 50000))
            // }
        }, 1000)
    })

    const outputUtxo = createMemo(() => {
        return findUtxoByOutpoint(redshiftResource()?.output_utxo, utxos())
    })

    createEffect(() => {
        setRedshifted(true, redshiftResource()?.output_utxo)
    })

    const network = state.mutiny_wallet?.get_network() as Network;


    return (
        <VStack biggap>

            {/* <VStack>
                <NiceP>We did it. Here's your new UTXO:</NiceP>
                <Show when={utxos() && outputUtxo()}>
                    <Card>
                        <Utxo item={outputUtxo()!} />
                    </Card>
                </Show>
            </VStack> */}
            <VStack>
                <NiceP>What happened?</NiceP>
                <Show when={redshiftResource()}>

                    <Card>
                        <VStack biggap>
                            {/* <KV key="Input utxo">
                            <Show when={utxos() && inputUtxo()}>
                                <Utxo item={inputUtxo()!} />
                            </Show>
                        </KV> */}
                            <KV key="Starting amount">
                                <Amount amountSats={redshiftResource().amount_sats} />
                            </KV>
                            <KV key="Fees paid">
                                <Amount amountSats={redshiftResource().fees_paid} />
                            </KV>
                            <KV key="Change">
                                <Amount amountSats={redshiftResource().change_amt} />
                            </KV>
                            <KV key="Outbound channel">
                                <VStack>
                                    <pre class="whitespace-pre-wrap break-all">{redshiftResource().introduction_channel}</pre>
                                    <a class="" href={mempoolTxUrl(redshiftResource().introduction_channel?.split(":")[0], network)} target="_blank" rel="noreferrer">
                                        View on mempool
                                    </a>
                                </VStack>
                            </KV>
                            <Show when={redshiftResource().output_channel}>
                                <KV key="Return channel">
                                    <VStack>
                                        <pre class="whitespace-pre-wrap break-all">{redshiftResource().output_channel}</pre>
                                        <a class="" href={mempoolTxUrl(redshiftResource().output_channel?.split(":")[0], network)} target="_blank" rel="noreferrer">
                                            View on mempool
                                        </a>

                                    </VStack>
                                </KV>
                            </Show>
                        </VStack>
                    </Card>
                </Show>
                <SmallHeader></SmallHeader>
            </VStack>
        </VStack>
    )
}

const SHIFT_OPTIONS = [{ value: "utxo", label: "UTXO", caption: "Trade your UTXO for a fresh UTXO" }, { value: "lightning", label: "Lightning", caption: "Convert your UTXO into Lightning" }]

export function Utxo(props: { item: UtxoItem, onClick?: () => void }) {
    const redshifted = createMemo(() => getRedshifted(props.item.outpoint));
    return (
        <>
            <div class={THREE_COLUMNS} onClick={props.onClick}>
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
                    <SmallHeader class={props.item?.is_spent ? "text-m-red" : "text-m-green"}>
                        {/* {props.item?.is_spent ? "SPENT" : "UNSPENT"} */}
                    </SmallHeader>
                </div>
            </div>
        </>
    )
}

const FAKE_STATES = ["Creating a new node", "Opening a channel", "Sending funds through", "Closing the channel", "Redshift complete"]

function ShiftObserver(props: { setShiftStage: (stage: ShiftStage) => void, redshiftId: String }) {
    const [state, _actions] = useMegaStore();

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

    async function checkRedshift(id: string) {
        console.log("Checking redshift", id)
        const redshift = await state.mutiny_wallet?.get_redshift(id);
        console.log(redshift)
        return redshift
    }

    const [redshiftResource, { refetch }] = createResource(props.redshiftId, checkRedshift);

    // onMount(() => {
    //     const interval = setInterval(() => {
    //         if (redshiftResource()) refetch();
    //         // if (sentAmount() === 200000) {
    //         //     clearInterval(interval)
    //         //     props.setShiftStage("success");
    //         //     // setSentAmount((0))

    //         // } else {
    //         //     setSentAmount((sentAmount() + 50000))
    //         // }
    //     }, 1000)
    // })

    // createEffect(() => {
    //     const interval = setInterval(() => {
    //         if (chosenUtxo()) refetch();
    //     }, 1000); // Poll every second
    //     onCleanup(() => {
    //         clearInterval(interval);
    //     });
    // });

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

export default function Redshift() {
    const [state, _actions] = useMegaStore();

    const [shiftStage, setShiftStage] = createSignal<ShiftStage>("choose");
    const [shiftType, setShiftType] = createSignal<ShiftOption>("utxo");

    const [chosenUtxo, setChosenUtxo] = createSignal<UtxoItem>();

    const getUtXos = async () => {
        console.log("Getting utxos");
        return await state.mutiny_wallet?.list_utxos() as UtxoItem[];
    }

    const getChannels = async () => {
        console.log("Getting channels");
        await state.mutiny_wallet?.sync()
        const channels = await state.mutiny_wallet?.list_channels() as Promise<MutinyChannel[]>;
        console.log(channels)
        return channels

    }

    const [utxos, { refetch: _refetchUtxos }] = createResource(getUtXos);
    const [channels, { refetch: _refetchChannels }] = createResource(getChannels);



    const redshiftedUtxos = createMemo(() => {
        return utxos()?.filter((utxo) => getRedshifted(utxo.outpoint))
    })

    const unredshiftedUtxos = createMemo(() => {
        return utxos()?.filter((utxo) => !getRedshifted(utxo.outpoint))
    })

    function resetState() {
        setShiftStage("choose");
        setShiftType("utxo");
        setChosenUtxo(undefined);
    }

    async function redshiftUtxo(utxo: UtxoItem) {
        console.log("Redshifting utxo", utxo.outpoint)
        const redshift = await state.mutiny_wallet?.init_redshift(utxo.outpoint);
        console.log("Redshift initialized:")
        console.log(redshift)
        return redshift
    }

    const [initializedRedshift, { refetch: _refetchRedshift }] = createResource(chosenUtxo, redshiftUtxo);

    createEffect(() => {
        if (chosenUtxo() && initializedRedshift()) {
            // window.location.href = "/"
            setShiftStage("observe");
        }
    })

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink />
                    <LargeHeader>Redshift</LargeHeader>
                    <VStack biggap>
                        {/* <pre>{JSON.stringify(redshiftResource(), null, 2)}</pre> */}
                        <Switch>
                            <Match when={shiftStage() === "choose"}>
                                <VStack>
                                    <NiceP>Where is this going?</NiceP>
                                    <StyledRadioGroup accent="red" value={shiftType()} onValueChange={(newValue) => setShiftType(newValue as ShiftOption)} choices={SHIFT_OPTIONS} />
                                </VStack>
                                <VStack>
                                    <NiceP>Choose your <span class="inline-block"><img class="h-4" src={wave} alt="sine wave" /></span> UTXO to begin</NiceP>
                                    <Suspense>
                                        <Card title="Unshifted UTXOs">
                                            <Switch>
                                                <Match when={utxos.loading}>
                                                    <LoadingSpinner wide />
                                                </Match>
                                                <Match when={utxos.state === "ready" && unredshiftedUtxos()?.length === 0}>
                                                    <code>No utxos (empty state)</code>
                                                </Match>
                                                <Match when={utxos.state === "ready" && unredshiftedUtxos() && unredshiftedUtxos()!.length >= 0}>
                                                    <For each={unredshiftedUtxos()}>
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
                                                <Match when={utxos.state === "ready" && redshiftedUtxos()?.length === 0}>
                                                    <code>No utxos (empty state)</code>
                                                </Match>
                                                <Match when={utxos.state === "ready" && redshiftedUtxos() && redshiftedUtxos()!.length >= 0}>
                                                    <For each={redshiftedUtxos()}>
                                                        {(utxo) =>
                                                            <Utxo item={utxo} />
                                                        }
                                                    </For>
                                                </Match>
                                            </Switch>
                                        </Card>
                                    </Suspense>
                                </VStack>
                            </Match>
                            <Match when={shiftStage() === "observe" && chosenUtxo()}>
                                <ShiftObserver setShiftStage={setShiftStage} utxo={chosenUtxo()!} />
                            </Match>
                            <Match when={shiftStage() === "success" && chosenUtxo()}>
                                <VStack biggap>
                                    <RedshiftReport redshift={dummyRedshift} utxo={chosenUtxo()!} />
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
        </MutinyWalletGuard>
    )
}