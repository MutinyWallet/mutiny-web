/* @refresh reload */

import {
    MutinyBip21RawMaterials,
    MutinyInvoice
} from "@mutinywallet/mutiny-wasm";
import { useNavigate } from "@solidjs/router";
import {
    createEffect,
    createMemo,
    createResource,
    createSignal,
    Match,
    onCleanup,
    Show,
    Switch
} from "solid-js";

import side2side from "~/assets/icons/side-to-side.svg";
import {
    ActivityDetailsModal,
    AmountEditable,
    AmountFiat,
    AmountSats,
    BackButton,
    BackLink,
    Button,
    Checkbox,
    DefaultMain,
    Fee,
    FeesModal,
    HackActivityType,
    Indicator,
    InfoBox,
    IntegratedQr,
    LargeHeader,
    MegaCheck,
    MutinyWalletGuard,
    NavBar,
    ReceiveWarnings,
    showToast,
    SimpleDialog,
    SimpleInput,
    StyledRadioGroup,
    SuccessModal,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify, objectToSearchParams, vibrateSuccess } from "~/utils";

type OnChainTx = {
    transaction: {
        version: number;
        lock_time: number;
        input: Array<{
            previous_output: string;
            script_sig: string;
            sequence: number;
            witness: Array<string>;
        }>;
        output: Array<{
            value: number;
            script_pubkey: string;
        }>;
    };
    txid: string;
    received: number;
    sent: number;
    confirmation_time: {
        height: number;
        timestamp: number;
    };
};

export type ReceiveFlavor = "unified" | "lightning" | "onchain";
type ReissueState = "show" | "success" | "failed";
type reissueState = "lightning_paid" | "onchain_paid";

function FeeWarning(props: { fee: bigint; flavor: ReceiveFlavor }) {
    const i18n = useI18n();
    return (
        // TODO: probably won't always be fixed 2500?
        <Show when={props.fee > 1000n}>
            <Switch>
                <Match when={props.flavor === "unified"}>
                    <InfoBox accent="blue">
                        {i18n.t("reissue.unified_setup_fee", {
                            amount: props.fee.toLocaleString()
                        })}
                        <FeesModal />
                    </InfoBox>
                </Match>
                <Match when={props.flavor === "lightning"}>
                    <InfoBox accent="blue">
                        {i18n.t("reissue.lightning_setup_fee", {
                            amount: props.fee.toLocaleString()
                        })}
                        <FeesModal />
                    </InfoBox>
                </Match>
            </Switch>
        </Show>
    );
}

export function Reissue() {
    const [state, actions] = useMegaStore();
    const navigate = useNavigate();
    const i18n = useI18n();

    const [amount, setAmount] = createSignal<bigint>(0n);
    const [whatForInput, setWhatForInput] = createSignal("");

    const [reissueState, setReissueState] = createSignal<ReissueState>("show");
    const [bip21Raw, setBip21Raw] = createSignal<MutinyBip21RawMaterials>();
    const [unified, setUnified] = createSignal("");

    const [lspFee, setLspFee] = createSignal(0n);

    // The data we get after a payment
    const [paymentTx, setPaymentTx] = createSignal<OnChainTx>();
    const [paymentInvoice, setPaymentInvoice] = createSignal<MutinyInvoice>();

    // The flavor of the reissue (defaults to unified)
    const [flavor, setFlavor] = createSignal<ReceiveFlavor>(
        state.preferredInvoiceType
    );

    // loading state for the continue button
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<string>("");

    // Details Modal
    const [detailsOpen, setDetailsOpen] = createSignal(false);
    const [detailsKind, setDetailsKind] = createSignal<HackActivityType>();
    const [detailsId, setDetailsId] = createSignal<string>("");

    function clearAll() {
        setAmount(0n);
        setReissueState("show");
        setBip21Raw(undefined);
        setUnified("");
        setPaymentTx(undefined);
        setPaymentInvoice(undefined);
        setError("");
        setFlavor(state.preferredInvoiceType);
    }

    async function onSubmit(e: Event) {
        e.preventDefault();

        await reissueEcash();
    }

    async function reissueEcash() {
        const currState = reissueState();
        console.log(currState);

        setLoading(true);
        try {
            await state.mutiny_wallet?.reissue_oob_notes(state.scan_result?.fedimint_oob_notes!);
            setReissueState("success");
            const currState = reissueState();
            console.log(currState);
        } catch (e) {
            // TODO: (@leonardo) how to handle the errors properly ?
            setReissueState("failed");
            console.log(error);
        }
        setLoading(false);

    }

    // const [paidState, { refetch }] = createResource(bip21Raw, checkIfPaid);

    // createEffect(() => {
    //     const interval = setInterval(() => {
    //         if (receiveState() === "show") refetch();
    //     }, 1000); // Poll every second
    //     onCleanup(() => {
    //         clearInterval(interval);
    //     });
    // });

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <Show when={reissueState() === "show"} fallback={<BackLink />}>
                    <BackButton
                        onClick={() => clearAll()}
                        title={i18n.t("reissue.edit")}
                        showOnDesktop
                    />
                </Show>
                <LargeHeader
                    action={
                        reissueState() === "show" && (
                            <Indicator>{i18n.t("reissue.checking")}</Indicator>
                        )
                    }
                >
                    {i18n.t("reissue.reissue_ecash")}
                </LargeHeader>
                <Switch>
                    <Match when={reissueState() === "show"}>
                        <div class="flex-1" />
                        <VStack>
                            <AmountEditable
                                initialAmountSats={state.scan_result?.amount_sats! || "0"}
                                frozenAmount={true}
                                setAmountSats={() => { }}>
                            </AmountEditable>
                            {/* <ReceiveWarnings
                                    amountSats={amount() || "0"}
                                    from_fedi_to_ln={false}
                                /> */}
                        </VStack>
                        <div class="flex-1" />
                        <VStack>
                            {/* TODO: (@leonardo) add the info input field ? */}
                            <Button
                                disabled={!state.scan_result?.amount_sats}
                                intent="green"
                                onClick={onSubmit}
                                loading={loading()}
                            >
                                {i18n.t("common.continue")}
                            </Button>
                        </VStack>
                    </Match>
                    <Match when={reissueState() === "success"}>
                        <SuccessModal
                            open={!!reissueState()}
                            setOpen={(open: boolean) => {
                                if (!open) clearAll();
                            }}
                            onConfirm={() => {
                                clearAll();
                                navigate("/");
                            }}
                        >
                            <Show when={detailsId() && detailsKind()}>
                                <ActivityDetailsModal
                                    open={detailsOpen()}
                                    kind={detailsKind()}
                                    id={detailsId()}
                                    setOpen={setDetailsOpen}
                                />
                            </Show>
                            <MegaCheck />
                            <h1 class="mb-2 mt-4 w-full text-center text-2xl font-semibold md:text-3xl">
                                {i18n.t("reissue.payment_received")}
                            </h1>
                            <div class="flex flex-col items-center gap-1">
                                <div class="text-xl">
                                    <AmountSats
                                        amountSats={state.scan_result?.amount_sats}
                                        icon="plus"
                                    />
                                </div>
                                <div class="text-white/70">
                                    <AmountFiat
                                        amountSats={state.scan_result?.amount_sats}
                                        denominationSize="sm"
                                    />
                                </div>
                            </div>
                            {/* TODO: (@leonardo) add the FederationId ? */}
                            <hr class="w-16 bg-m-grey-400" />
                            {/* <Show
                                when={
                                    receiveState() === "paid" &&
                                    paidState() === "lightning_paid"
                                }
                            >
                                <Fee amountSats={lspFee()} />
                            </Show> */}
                            {/*TODO: Confirmation time estimate still not possible needs to be implemented in mutiny-node first*/}
                            {/* <Show when={receiveState() === "paid"}>
                                <p
                                    class="cursor-pointer underline"
                                    onClick={openDetailsModal}
                                >
                                    {i18n.t("common.view_payment_details")}
                                </p>
                            </Show> */}
                        </SuccessModal>
                    </Match>
                </Switch>
            </DefaultMain>
            <NavBar activeTab="reissue" />
        </MutinyWalletGuard>
    );
}
