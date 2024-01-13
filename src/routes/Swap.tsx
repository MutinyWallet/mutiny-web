import { createForm, required } from "@modular-forms/solid";
import { MutinyChannel, MutinyPeer } from "@mutinywallet/mutiny-wasm";
import { useNavigate } from "@solidjs/router";
import {
    createMemo,
    createResource,
    createSignal,
    For,
    Match,
    Show,
    Switch
} from "solid-js";

import {
    ActivityDetailsModal,
    AmountEditable,
    AmountFiat,
    BackLink,
    Button,
    Card,
    DefaultMain,
    FeeDisplay,
    HackActivityType,
    InfoBox,
    LargeHeader,
    MegaCheck,
    MegaEx,
    MutinyWalletGuard,
    NavBar,
    showToast,
    SuccessModal,
    TextField,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { Network } from "~/logic/mutinyWalletSetup";
import { useMegaStore } from "~/state/megaStore";
import { eify, vibrateSuccess } from "~/utils";

const CHANNEL_FEE_ESTIMATE_ADDRESS =
    "bc1qf7546vg73ddsjznzq57z3e8jdn6gtw6au576j07kt6d9j7nz8mzsyn6lgf";

type PeerConnectForm = {
    peer: string;
};

type ChannelOpenDetails = {
    channel?: MutinyChannel;
    failure_reason?: Error;
};

export function Swap() {
    const [state, _actions] = useMegaStore();
    const navigate = useNavigate();
    const i18n = useI18n();

    const [amountSats, setAmountSats] = createSignal(0n);
    const [isConnecting, setIsConnecting] = createSignal(false);

    const [loading, setLoading] = createSignal(false);

    const [selectedPeer, setSelectedPeer] = createSignal<string>("");

    // Details Modal
    const [detailsOpen, setDetailsOpen] = createSignal(false);
    const [detailsKind, setDetailsKind] = createSignal<HackActivityType>();
    const [detailsId, setDetailsId] = createSignal("");

    const [channelOpenResult, setChannelOpenResult] =
        createSignal<ChannelOpenDetails>();

    function openDetailsModal() {
        const paymentTxId =
            channelOpenResult()?.channel?.outpoint?.split(":")[0];
        const kind: HackActivityType = "ChannelOpen";

        console.log("Opening details modal: ", paymentTxId, kind);

        if (!paymentTxId) {
            console.warn("No id provided to openDetailsModal");
            return;
        }
        if (paymentTxId !== undefined) {
            setDetailsId(paymentTxId);
        }
        setDetailsKind(kind);
        setDetailsOpen(true);
    }

    function resetState() {
        setAmountSats(0n);
        setIsConnecting(false);
        setLoading(false);
        setSelectedPeer("");
        setChannelOpenResult(undefined);
    }

    const hasLsp = () => {
        return !!state.settings?.lsp;
    };

    const getPeers = async () => {
        return (await state.mutiny_wallet?.list_peers()) as Promise<
            MutinyPeer[]
        >;
    };

    const [peers, { refetch }] = createResource(getPeers);

    const [_peerForm, { Form, Field }] = createForm<PeerConnectForm>();

    const onSubmit = async (values: PeerConnectForm) => {
        setIsConnecting(true);
        try {
            const peerConnectString = values.peer.trim();

            await state.mutiny_wallet?.connect_to_peer(peerConnectString);

            await refetch();

            // If peers list contains the peer we just connected to, select it
            const peer = peers()?.find(
                (p) => p.pubkey === peerConnectString.split("@")[0]
            );

            if (peer) {
                setSelectedPeer(peer.pubkey);
            } else {
                showToast(new Error(i18n.t("swap.peer_not_found")));
            }
        } catch (e) {
            showToast(eify(e));
        } finally {
            setIsConnecting(false);
        }
    };

    const handlePeerSelect = (
        e: Event & {
            currentTarget: HTMLSelectElement;
            target: HTMLSelectElement;
        }
    ) => {
        setSelectedPeer(e.currentTarget.value);
    };

    const handleSwap = async () => {
        if (canSwap()) {
            try {
                setLoading(true);

                let peer = undefined;

                if (!hasLsp()) {
                    peer = selectedPeer();
                }

                if (isMax()) {
                    const new_channel =
                        await state.mutiny_wallet?.sweep_all_to_channel(peer);

                    setChannelOpenResult({ channel: new_channel });
                } else {
                    const new_channel = await state.mutiny_wallet?.open_channel(
                        peer,
                        amountSats()
                    );

                    setChannelOpenResult({ channel: new_channel });
                }

                await vibrateSuccess();
            } catch (e) {
                setChannelOpenResult({ failure_reason: eify(e) });
            } finally {
                setLoading(false);
            }
        }
    };

    const canSwap = () => {
        const balance =
            (state.balance?.confirmed || 0n) +
            (state.balance?.unconfirmed || 0n);
        const network = state.mutiny_wallet?.get_network() as Network;

        if (network === "bitcoin") {
            return (
                (!!selectedPeer() || !!hasLsp()) &&
                amountSats() >= 100000n &&
                amountSats() <= balance
            );
        } else {
            return (
                (!!selectedPeer() || !!hasLsp()) &&
                amountSats() >= 10000n &&
                amountSats() <= balance
            );
        }
    };

    const amountWarning = () => {
        if (amountSats() === 0n || !!channelOpenResult()) {
            return undefined;
        }

        const network = state.mutiny_wallet?.get_network() as Network;

        if (network === "bitcoin" && amountSats() < 100000n) {
            return i18n.t("swap.channel_too_small", { amount: "100,000" });
        }

        if (amountSats() < 10000n) {
            return i18n.t("swap.channel_too_small", { amount: "10,000" });
        }

        if (
            amountSats() >
                (state.balance?.confirmed || 0n) +
                    (state.balance?.unconfirmed || 0n) ||
            !feeEstimate()
        ) {
            return i18n.t("swap.insufficient_funds");
        }

        return undefined;
    };

    function calculateMaxOnchain() {
        return (
            (state.balance?.confirmed ?? 0n) +
            (state.balance?.unconfirmed ?? 0n)
        );
    }

    const maxOnchain = createMemo(() => {
        return calculateMaxOnchain();
    });

    const isMax = createMemo(() => {
        return amountSats() === calculateMaxOnchain();
    });

    const feeEstimate = createMemo(() => {
        const max = calculateMaxOnchain();
        // If max we want to use the sweep fee estimator
        if (amountSats() > 0n && amountSats() === max) {
            try {
                return state.mutiny_wallet?.estimate_sweep_channel_open_fee();
            } catch (e) {
                console.error(e);
                return undefined;
            }
        }

        if (amountSats() > 0n) {
            try {
                return state.mutiny_wallet?.estimate_tx_fee(
                    CHANNEL_FEE_ESTIMATE_ADDRESS,
                    amountSats(),
                    undefined
                );
            } catch (e) {
                console.error(e);
                return undefined;
            }
        }
        return undefined;
    });

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <BackLink />
                <LargeHeader>{i18n.t("swap.header")}</LargeHeader>
                <SuccessModal
                    confirmText={
                        channelOpenResult()?.channel
                            ? i18n.t("common.nice")
                            : i18n.t("common.home")
                    }
                    open={!!channelOpenResult()}
                    setOpen={(open: boolean) => {
                        if (!open) resetState();
                    }}
                    onConfirm={() => {
                        resetState();
                        navigate("/");
                    }}
                >
                    <Switch>
                        <Match when={channelOpenResult()?.failure_reason}>
                            <MegaEx />
                            <h1 class="mb-2 mt-4 w-full text-center text-2xl font-semibold md:text-3xl">
                                {channelOpenResult()?.failure_reason
                                    ? channelOpenResult()?.failure_reason
                                          ?.message
                                    : ""}
                            </h1>
                            {/*TODO: Error hint needs to be added for possible failure reasons*/}
                        </Match>
                        <Match when={channelOpenResult()?.channel}>
                            <Show when={detailsId() && detailsKind()}>
                                <ActivityDetailsModal
                                    open={detailsOpen()}
                                    kind={detailsKind()}
                                    id={detailsId()}
                                    setOpen={setDetailsOpen}
                                />
                            </Show>
                            <MegaCheck />
                            <div class="flex flex-col justify-center">
                                <h1 class="mb-2 mt-4 w-full justify-center text-center text-2xl font-semibold md:text-3xl">
                                    {i18n.t("swap.initiated")}
                                </h1>
                                <p class="text-center text-xl">
                                    {i18n.t("swap.sats_added", {
                                        amount: (
                                            Number(
                                                channelOpenResult()?.channel
                                                    ?.balance
                                            ) +
                                            Number(
                                                channelOpenResult()?.channel
                                                    ?.reserve
                                            )
                                        ).toLocaleString()
                                    })}
                                </p>
                                <div class="text-center text-sm text-white/70">
                                    <AmountFiat
                                        amountSats={
                                            Number(
                                                channelOpenResult()?.channel
                                                    ?.balance
                                            ) +
                                            Number(
                                                channelOpenResult()?.channel
                                                    ?.reserve
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <hr class="w-16 bg-m-grey-400" />
                            <p
                                class="cursor-pointer underline"
                                onClick={openDetailsModal}
                            >
                                {i18n.t("common.view_payment_details")}
                            </p>
                            {/* <pre>{JSON.stringify(channelOpenResult()?.channel?.value, null, 2)}</pre> */}
                        </Match>
                    </Switch>
                </SuccessModal>
                <div class="flex flex-1 flex-col justify-between gap-2">
                    <div class="flex-1" />
                    <VStack biggap>
                        <Show when={!hasLsp()}>
                            <Card>
                                <VStack>
                                    <div class="flex w-full flex-col gap-2">
                                        <label
                                            for="peerselect"
                                            class="text-sm font-semibold uppercase"
                                        >
                                            {i18n.t("swap.use_existing")}
                                        </label>
                                        <select
                                            name="peerselect"
                                            class="w-full truncate rounded bg-black px-4 py-2"
                                            onChange={handlePeerSelect}
                                            value={selectedPeer()}
                                        >
                                            <option value="" class="" selected>
                                                {i18n.t("swap.choose_peer")}
                                            </option>
                                            <For each={peers()}>
                                                {(peer) => (
                                                    <option value={peer.pubkey}>
                                                        {peer.alias ??
                                                            peer.pubkey}
                                                    </option>
                                                )}
                                            </For>
                                        </select>
                                    </div>
                                    <Show when={!selectedPeer()}>
                                        <Form
                                            onSubmit={onSubmit}
                                            class="flex flex-col gap-4"
                                        >
                                            <Field
                                                name="peer"
                                                validate={[required("")]}
                                            >
                                                {(field, props) => (
                                                    <TextField
                                                        {...props}
                                                        value={field.value}
                                                        error={field.error}
                                                        label={i18n.t(
                                                            "swap.peer_connect_label"
                                                        )}
                                                        placeholder={i18n.t(
                                                            "swap.peer_connect_placeholder"
                                                        )}
                                                    />
                                                )}
                                            </Field>
                                            <Button
                                                layout="small"
                                                type="submit"
                                                disabled={isConnecting()}
                                            >
                                                {isConnecting()
                                                    ? i18n.t("swap.connecting")
                                                    : i18n.t("swap.connect")}
                                            </Button>
                                        </Form>
                                    </Show>
                                </VStack>
                            </Card>
                        </Show>
                        <AmountEditable
                            initialAmountSats={amountSats()}
                            setAmountSats={setAmountSats}
                            fee={feeEstimate()?.toString()}
                            activeMethod={{
                                method: "onchain",
                                maxAmountSats: maxOnchain()
                            }}
                            methods={[
                                {
                                    method: "onchain",
                                    maxAmountSats: maxOnchain()
                                }
                            ]}
                        />
                        <Show when={feeEstimate() && amountSats() > 0n}>
                            <FeeDisplay
                                amountSats={amountSats().toString()}
                                fee={feeEstimate()!.toString()}
                                maxAmountSats={maxOnchain()}
                            />
                        </Show>
                        <Show when={amountWarning() && amountSats() > 0n}>
                            <InfoBox accent={"red"}>{amountWarning()}</InfoBox>
                        </Show>
                    </VStack>
                    <div class="flex-1" />
                    <VStack>
                        <Button
                            disabled={!canSwap()}
                            intent="blue"
                            onClick={handleSwap}
                            loading={loading()}
                        >
                            {i18n.t("swap.confirm_swap")}
                        </Button>
                    </VStack>
                </div>
            </DefaultMain>
            <NavBar activeTab="none" />
        </MutinyWalletGuard>
    );
}
