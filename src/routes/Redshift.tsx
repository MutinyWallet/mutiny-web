import {
    createEffect,
    createMemo,
    createResource,
    createSignal,
    For,
    Match,
    onMount,
    ParentComponent,
    Show,
    Suspense,
    Switch
} from "solid-js";
import {
    CENTER_COLUMN,
    MISSING_LABEL,
    REDSHIFT_LABEL,
    RIGHT_COLUMN,
    THREE_COLUMNS,
    UtxoItem
} from "~/components/Activity";
import {
    Card,
    DefaultMain,
    LargeHeader,
    LoadingSpinner,
    NiceP,
    MutinyWalletGuard,
    SafeArea,
    SmallAmount,
    SmallHeader,
    VStack
} from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import { StyledRadioGroup } from "~/components/layout/Radio";
import NavBar from "~/components/NavBar";
import { useMegaStore } from "~/state/megaStore";
import wave from "~/assets/wave.gif";
import utxoIcon from "~/assets/icons/coin.svg";
import { Button } from "~/components/layout/Button";
import { ProgressBar } from "~/components/layout/ProgressBar";
import { MutinyChannel } from "@mutinywallet/mutiny-wasm";
import mempoolTxUrl from "~/utils/mempoolTxUrl";
import { AmountSats } from "~/components/Amount";
import { getRedshifted, setRedshifted } from "~/utils/fakeLabels";
import { Network } from "~/logic/mutinyWalletSetup";
import { useI18n } from "~/i18n/context";

type ShiftOption = "utxo" | "lightning";

type ShiftStage = "choose" | "observe" | "success" | "failure";

type OutPoint = string; // Replace with the actual TypeScript type for OutPoint
type RedshiftStatus = string; // Replace with the actual TypeScript type for RedshiftStatus
type RedshiftRecipient = unknown; // Replace with the actual TypeScript type for RedshiftRecipient
type PublicKey = unknown; // Replace with the actual TypeScript type for PublicKey

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
    input_utxo:
        "44036599c37d590899e8d5d92086028695d2c2966fdc354ce1da9a9eac610a53:1",
    status: "Completed", // Replace with a dummy value for RedshiftStatus
    recipient: {}, // Replace with a dummy value for RedshiftRecipient
    output_utxo:
        "44036599c37d590899e8d5d92086028695d2c2966fdc354ce1da9a9eac610a53:1",
    introduction_channel:
        "a7773e57f8595848a635e9af105927cac9ecaf292d71a76456ae0455bd3c9c64:0",
    output_channel:
        "a7773e57f8595848a635e9af105927cac9ecaf292d71a76456ae0455bd3c9c64:0",
    introduction_node: {}, // Replace with a dummy value for PublicKey
    amount_sats: BigInt(1000000),
    change_amt: BigInt(12345),
    fees_paid: BigInt(2500)
};

function RedshiftReport(props: { redshift: RedshiftResult; utxo: UtxoItem }) {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const getUtXos = async () => {
        console.log("Getting utxos");
        return (await state.mutiny_wallet?.list_utxos()) as UtxoItem[];
    };

    // function findUtxoByOutpoint(
    //   outpoint?: string,
    //   utxos: UtxoItem[] = []
    // ): UtxoItem | undefined {
    //   if (!outpoint) return undefined
    //   return utxos.find((utxo) => utxo.outpoint === outpoint)
    // }

    const [_utxos, { refetch: _refetchUtxos }] = createResource(getUtXos);

    // const inputUtxo = createMemo(() => {
    //   console.log(utxos())
    //   const foundUtxo = findUtxoByOutpoint(props.redshift.input_utxo, utxos())
    //   console.log("Found utxo:", foundUtxo)
    //   return foundUtxo
    // })

    const [redshiftResource, { refetch: _refetchRedshift }] = createResource(
        async () => {
            console.log("Checking redshift", props.redshift.id);
            const redshift = await state.mutiny_wallet?.get_redshift(
                props.redshift.id
            );
            console.log(redshift);
            return redshift;
        }
    );
    onMount(() => {
        //   const interval = setInterval(() => {
        //     if (redshiftResource()) refetch()
        //     // if (sentAmount() === 200000) {
        //     //     clearInterval(interval)
        //     //     props.setShiftStage("success");
        //     //     // setSentAmount((0))
        //     // } else {
        //     //     setSentAmount((sentAmount() + 50000))
        //     // }
        //   }, 1000)
    });

    // const outputUtxo = createMemo(() => {
    //   return findUtxoByOutpoint(redshiftResource()?.output_utxo, utxos())
    // })

    createEffect(() => {
        setRedshifted(true, redshiftResource()?.output_utxo);
    });

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
                <NiceP>{i18n.t("redshift.what_happened")}</NiceP>
                <Show when={redshiftResource()}>
                    <Card>
                        <VStack biggap>
                            {/* <KV key="Input utxo">
                            <Show when={utxos() && inputUtxo()}>
                                <Utxo item={inputUtxo()!} />
                            </Show>
                        </KV> */}
                            <KV key={i18n.t("redshift.starting_amount")}>
                                <AmountSats
                                    amountSats={redshiftResource()!.amount_sats}
                                />
                            </KV>
                            <KV key={i18n.t("redshift.fees_paid")}>
                                <AmountSats
                                    amountSats={redshiftResource()!.fees_paid}
                                />
                            </KV>
                            <KV key={i18n.t("redshift.change")}>
                                <AmountSats
                                    amountSats={redshiftResource()!.change_amt}
                                />
                            </KV>
                            <KV key={i18n.t("redshift.outbound_channel")}>
                                <VStack>
                                    <pre class="whitespace-pre-wrap break-all">
                                        {
                                            redshiftResource()!
                                                .introduction_channel
                                        }
                                    </pre>
                                    <a
                                        class=""
                                        href={mempoolTxUrl(
                                            redshiftResource()!.introduction_channel?.split(
                                                ":"
                                            )[0],
                                            network
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {i18n.t("common.view_transaction")}
                                    </a>
                                </VStack>
                            </KV>
                            <Show when={redshiftResource()!.output_channel}>
                                <KV key={i18n.t("redshift.return_channel")}>
                                    <VStack>
                                        <pre class="whitespace-pre-wrap break-all">
                                            {redshiftResource()!.output_channel}
                                        </pre>
                                        <a
                                            class=""
                                            href={mempoolTxUrl(
                                                redshiftResource()!.output_channel?.split(
                                                    ":"
                                                )[0],
                                                network
                                            )}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {i18n.t("common.view_transaction")}
                                        </a>
                                    </VStack>
                                </KV>
                            </Show>
                        </VStack>
                    </Card>
                </Show>
            </VStack>
        </VStack>
    );
}

export function Utxo(props: { item: UtxoItem; onClick?: () => void }) {
    const i18n = useI18n();
    const redshifted = createMemo(() => getRedshifted(props.item.outpoint));
    return (
        <>
            <div
                class={THREE_COLUMNS}
                onClick={() => props.onClick && props.onClick()}
            >
                <div class="flex items-center">
                    <img src={utxoIcon} alt="coin" />
                </div>
                <div class={CENTER_COLUMN}>
                    <div class="flex gap-2">
                        <Show
                            when={redshifted()}
                            fallback={
                                <h2 class={MISSING_LABEL}>
                                    {i18n.t("redshift.unknown")}
                                </h2>
                            }
                        >
                            <h2 class={REDSHIFT_LABEL}>
                                {i18n.t("redshift.title")}
                            </h2>
                        </Show>
                    </div>
                    <SmallAmount amount={props.item.txout.value} />
                </div>
                <div class={RIGHT_COLUMN}>
                    <SmallHeader
                        class={
                            props.item?.is_spent ? "text-m-red" : "text-m-green"
                        }
                    >
                        {/* {props.item?.is_spent ? "SPENT" : "UNSPENT"} */}
                    </SmallHeader>
                </div>
            </div>
        </>
    );
}

const FAKE_STATES = [
    "Creating a new node",
    "Opening a channel",
    "Sending funds through",
    "Closing the channel",
    "Redshift complete"
];

function ShiftObserver(props: {
    setShiftStage: (stage: ShiftStage) => void;
    redshiftId: string;
}) {
    const i18n = useI18n();
    const [_state, _actions] = useMegaStore();

    const [fakeStage, _setFakeStage] = createSignal(2);

    const [sentAmount, setSentAmount] = createSignal(0);

    onMount(() => {
        const interval = setInterval(() => {
            if (sentAmount() === 200000) {
                clearInterval(interval);
                props.setShiftStage("success");
                // setSentAmount((0))
            } else {
                setSentAmount(sentAmount() + 50000);
            }
        }, 1000);
    });

    // async function checkRedshift(id: string) {
    //   console.log("Checking redshift", id)
    //   const redshift = await state.mutiny_wallet?.get_redshift(id)
    //   console.log(redshift)
    //   return redshift
    // }

    // const [redshiftResource, { refetch }] = createResource(
    //   props.redshiftId,
    //   checkRedshift
    // )

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
            <NiceP>{i18n.t("redshift.watch_it_go")}</NiceP>
            <Card>
                <VStack>
                    <pre class="self-center">{FAKE_STATES[fakeStage()]}</pre>
                    <ProgressBar value={sentAmount()} max={200000} />
                    <img src={wave} class="h-4 self-center" alt="sine wave" />
                </VStack>
            </Card>
        </>
    );
}

const KV: ParentComponent<{ key: string }> = (props) => {
    return (
        <div class="flex flex-col gap-2">
            <p class="text-sm font-semibold uppercase">{props.key}</p>
            {props.children}
        </div>
    );
};

export default function Redshift() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const [shiftStage, setShiftStage] = createSignal<ShiftStage>("choose");
    const [shiftType, setShiftType] = createSignal<ShiftOption>("utxo");

    const [chosenUtxo, setChosenUtxo] = createSignal<UtxoItem>();

    const SHIFT_OPTIONS = [
        {
            value: "utxo",
            label: i18n.t("redshift.utxo_label"),
            caption: i18n.t("redshift.utxo_caption")
        },
        {
            value: "lightning",
            label: i18n.t("redshift.lightning_label"),
            caption: i18n.t("redshift.lightning_caption")
        }
    ];

    const getUtXos = async () => {
        console.log("Getting utxos");
        return (await state.mutiny_wallet?.list_utxos()) as UtxoItem[];
    };

    // TODO: FIXME: this is old code needs to be revisited!
    const getChannels = async () => {
        console.log("Getting channels");
        // await state.mutiny_wallet?.sync();
        const channels =
            (await state.mutiny_wallet?.list_channels()) as Promise<
                MutinyChannel[]
            >;
        console.log(channels);
        return channels;
    };

    const [utxos, { refetch: _refetchUtxos }] = createResource(getUtXos);
    const [_channels, { refetch: _refetchChannels }] =
        createResource(getChannels);

    const redshiftedUtxos = createMemo(() => {
        return utxos()?.filter((utxo) => getRedshifted(utxo.outpoint));
    });

    const unredshiftedUtxos = createMemo(() => {
        return utxos()?.filter((utxo) => !getRedshifted(utxo.outpoint));
    });

    function resetState() {
        setShiftStage("choose");
        setShiftType("utxo");
        setChosenUtxo(undefined);
    }

    async function redshiftUtxo(utxo: UtxoItem) {
        console.log("Redshifting utxo", utxo.outpoint);
        const redshift = await state.mutiny_wallet?.init_redshift(
            utxo.outpoint
        );
        console.log("Redshift initialized:");
        console.log(redshift);
        return redshift;
    }

    const [initializedRedshift, { refetch: _refetchRedshift }] = createResource(
        chosenUtxo,
        redshiftUtxo
    );

    createEffect(() => {
        if (chosenUtxo() && initializedRedshift()) {
            // window.location.href = "/"
            setShiftStage("observe");
        }
    });

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink />
                    <LargeHeader>
                        {i18n.t("redshift.title")}{" "}
                        {i18n.t("common.coming_soon")}
                    </LargeHeader>
                    <div class="relative filter grayscale pointer-events-none opacity-75">
                        <VStack biggap>
                            {/* <pre>{JSON.stringify(redshiftResource(), null, 2)}</pre> */}
                            <Switch>
                                <Match when={shiftStage() === "choose"}>
                                    <VStack>
                                        <NiceP>
                                            {i18n.t("redshift.where_this_goes")}
                                        </NiceP>
                                        <StyledRadioGroup
                                            accent="red"
                                            value={shiftType()}
                                            onValueChange={(newValue) =>
                                                setShiftType(
                                                    newValue as ShiftOption
                                                )
                                            }
                                            choices={SHIFT_OPTIONS}
                                        />
                                    </VStack>
                                    <VStack>
                                        <NiceP>
                                            {i18n.t("redshift.choose_your")}{" "}
                                            <span class="inline-block">
                                                <img
                                                    class="h-4"
                                                    src={wave}
                                                    alt="sine wave"
                                                />
                                            </span>{" "}
                                            {i18n.t("redshift.utxo_to_begin")}
                                        </NiceP>
                                        <Suspense>
                                            <Card
                                                title={i18n.t(
                                                    "redshift.unshifted_utxo"
                                                )}
                                            >
                                                <Switch>
                                                    <Match when={utxos.loading}>
                                                        <LoadingSpinner wide />
                                                    </Match>
                                                    <Match
                                                        when={
                                                            utxos.state ===
                                                                "ready" &&
                                                            unredshiftedUtxos()
                                                                ?.length === 0
                                                        }
                                                    >
                                                        <code>
                                                            {i18n.t(
                                                                "redshift.no_utxos_empty_state"
                                                            )}
                                                        </code>
                                                    </Match>
                                                    <Match
                                                        when={
                                                            utxos.state ===
                                                                "ready" &&
                                                            unredshiftedUtxos() &&
                                                            unredshiftedUtxos()!
                                                                .length >= 0
                                                        }
                                                    >
                                                        <For
                                                            each={unredshiftedUtxos()}
                                                        >
                                                            {(utxo) => (
                                                                <Utxo
                                                                    item={utxo}
                                                                    onClick={() =>
                                                                        setChosenUtxo(
                                                                            utxo
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                        </For>
                                                    </Match>
                                                </Switch>
                                            </Card>
                                        </Suspense>
                                        <Suspense>
                                            <Card
                                                titleElement={
                                                    <SmallHeader>
                                                        <span class="text-m-red">
                                                            {i18n.t(
                                                                "redshift.redshifted"
                                                            )}{" "}
                                                        </span>
                                                        {i18n.t(
                                                            "redshift.utxos"
                                                        )}
                                                    </SmallHeader>
                                                }
                                            >
                                                <Switch>
                                                    <Match when={utxos.loading}>
                                                        <LoadingSpinner wide />
                                                    </Match>
                                                    <Match
                                                        when={
                                                            utxos.state ===
                                                                "ready" &&
                                                            redshiftedUtxos()
                                                                ?.length === 0
                                                        }
                                                    >
                                                        <code>
                                                            {i18n.t(
                                                                "redshift.no_utxos_empty_state"
                                                            )}
                                                        </code>
                                                    </Match>
                                                    <Match
                                                        when={
                                                            utxos.state ===
                                                                "ready" &&
                                                            redshiftedUtxos() &&
                                                            redshiftedUtxos()!
                                                                .length >= 0
                                                        }
                                                    >
                                                        <For
                                                            each={redshiftedUtxos()}
                                                        >
                                                            {(utxo) => (
                                                                <Utxo
                                                                    item={utxo}
                                                                />
                                                            )}
                                                        </For>
                                                    </Match>
                                                </Switch>
                                            </Card>
                                        </Suspense>
                                    </VStack>
                                </Match>
                                <Match
                                    when={
                                        shiftStage() === "observe" &&
                                        chosenUtxo()
                                    }
                                >
                                    <ShiftObserver
                                        setShiftStage={setShiftStage}
                                        redshiftId="dummy-redshift"
                                    />
                                </Match>
                                <Match
                                    when={
                                        shiftStage() === "success" &&
                                        chosenUtxo()
                                    }
                                >
                                    <VStack biggap>
                                        <RedshiftReport
                                            redshift={dummyRedshift}
                                            utxo={chosenUtxo()!}
                                        />
                                        <Button
                                            intent="red"
                                            onClick={resetState}
                                        >
                                            {i18n.t("common.nice")}
                                        </Button>
                                    </VStack>
                                </Match>
                                <Match when={shiftStage() === "failure"}>
                                    <NiceP>{i18n.t("redshift.oh_dear")}</NiceP>
                                    <NiceP>
                                        {i18n.t("redshift.here_is_error")}
                                    </NiceP>
                                    <Button intent="red" onClick={resetState}>
                                        {i18n.t("common.dangit")}
                                    </Button>
                                </Match>
                            </Switch>
                        </VStack>
                    </div>
                </DefaultMain>
                <NavBar activeTab="redshift" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
