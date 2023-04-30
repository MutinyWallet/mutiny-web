import { createEffect, createMemo, createResource, createSignal, For, Match, onMount, Suspense, Switch } from "solid-js";
import { CENTER_COLUMN, MISSING_LABEL, REDSHIFT_LABEL, RIGHT_COLUMN, THREE_COLUMNS, UtxoItem } from "~/components/Activity";
import { Card, DefaultMain, LargeHeader, LoadingSpinner, NiceP, NodeManagerGuard, SafeArea, SmallAmount, SmallHeader, VStack } from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import { StyledRadioGroup } from "~/components/layout/Radio";
import NavBar from "~/components/NavBar";
import { useMegaStore } from "~/state/megaStore";
import wave from "~/assets/wave.gif"

type ShiftOption = "utxo" | "lightning"

type ShiftStage = "choose" | "observe" | "success" | "failure"


const SHIFT_OPTIONS = [{ value: "utxo", label: "UTXO", caption: "Trade your UTXO for a fresh UTXO" }, { value: "lightning", label: "Lightning", caption: "Convert your UTXO into Lightning" }]

import receive from '~/assets/icons/receive.svg';
import { Button } from "~/components/layout/Button";
import { ProgressBar } from "~/components/layout/ProgressBar";

export function Utxo(props: { item: UtxoItem, onClick?: () => void, redshifted?: boolean }) {
    const spent = createMemo(() => props.item.is_spent);


    return (
        <>
            <div class={`${THREE_COLUMNS} ${props.redshifted && "bg-gradient-to-t from-m-red/10 to-transparent rounded-lg"}`} onClick={props.onClick}>
                <img src={receive} alt="receive arrow" />

                <div class={CENTER_COLUMN}>
                    <div class="flex gap-2">
                        {props.redshifted && <h2 class={REDSHIFT_LABEL}>RS</h2>}
                        {!props.item.redshifted && <h2 class={MISSING_LABEL}>Unknown</h2>}
                    </div>
                    <SmallAmount amount={props.item.txout.value} />
                </div>
                <div class={RIGHT_COLUMN}>
                    <SmallHeader class={props.item?.is_spent ? "text-m-red" : "text-m-green"}>
                        {props.item?.is_spent ? "SPENT" : "UNSPENT"}
                    </SmallHeader>
                </div>
            </div>
        </>
    )
}

const FAKE_STATES = ["Creating a new node", "Opening a channel", "Sending funds through", "Closing the channel", "Redshift complete"]

function ShiftObserver(props: { setShiftStage: (stage: ShiftStage) => void }, utxo: UtxoItem) {
    const [fakeStage, setFakeStage] = createSignal(2);

    // onMount(() => {
    //     const interval = setInterval(() => {
    //         console.log("intervaling")
    //         if (fakeStage() === FAKE_STATES.length - 1) {
    //             clearInterval(interval)
    //             props.setShiftStage("success");
    //         } else {
    //             setFakeStage((fakeStage() + 1))
    //         }
    //         // cont()
    //     }, 1000)
    //     // return () => clearInterval(interval);
    // })

    const [sentAmount, setSentAmount] = createSignal(0);

    onMount(() => {
        const interval = setInterval(() => {
            if (sentAmount() === 200000) {
                // clearInterval(interval)
                // props.setShiftStage("success");
                setSentAmount((0))

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


export default function Redshift() {
    const [state, _actions] = useMegaStore();

    const [shiftStage, setShiftStage] = createSignal<ShiftStage>("observe");
    const [shiftType, setShiftType] = createSignal<ShiftOption>("utxo");

    const [chosenUtxo, setChosenUtxo] = createSignal<UtxoItem>();

    const getUtXos = async () => {
        console.log("Getting utxos");
        const utxos = await state.node_manager?.list_utxos() as UtxoItem[];
        return utxos;
    }

    const [utxos, { refetch: _refetchUtxos }] = createResource(getUtXos);

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
                                                            <Utxo item={utxo} />
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
                                <VStack>
                                    <NiceP>We did it. Here's your new UTXO:</NiceP>
                                    <Card>
                                        <Utxo item={chosenUtxo() ?? chosenUtxo()!} redshifted />
                                    </Card>
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