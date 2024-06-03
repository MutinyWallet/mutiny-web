import { MutinyInvoice } from "@mutinywallet/mutiny-wasm";
import { useNavigate } from "@solidjs/router";
import { CircleHelp, Link, Users, Zap } from "lucide-solid";
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

import {
    ActivityDetailsModal,
    AmountEditable,
    AmountFiat,
    AmountSats,
    BackButton,
    BackLink,
    Button,
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
    SharpButton,
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

export type OnChainTx = {
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
    internal_id: string;
    received: number;
    sent: number;
    confirmation_time: {
        height: number;
        timestamp: number;
    };
};

export type ReceiveFlavor = "lightning" | "onchain";
type ReceiveState = "edit" | "show" | "paid";
type PaidState = "lightning_paid" | "onchain_paid";

function FeeWarning(props: { fee: bigint; flavor: ReceiveFlavor }) {
    const i18n = useI18n();
    return (
        <Show when={props.fee > 1000n && props.flavor === "lightning"}>
            <InfoBox accent="blue">
                {i18n.t("receive.lightning_setup_fee", {
                    amount: props.fee.toLocaleString()
                })}
                <FeesModal />
            </InfoBox>
        </Show>
    );
}

function FlavorChooser(props: {
    flavor: ReceiveFlavor;
    setFlavor: (value: string) => void;
}) {
    const [methodChooserOpen, setMethodChooserOpen] = createSignal(false);
    const i18n = useI18n();

    const RECEIVE_FLAVORS = [
        {
            value: "lightning",
            label: i18n.t("receive.lightning_label"),
            caption: i18n.t("receive.lightning_caption")
        },
        {
            value: "onchain",
            label: i18n.t("receive.onchain_label"),
            caption: i18n.t("receive.onchain_caption")
        }
    ];
    return (
        <>
            <SharpButton onClick={() => setMethodChooserOpen(true)}>
                {props.flavor === "lightning" ? (
                    <Zap class="h-4 w-4" />
                ) : (
                    <Link class="h-4 w-4" />
                )}
                {props.flavor === "lightning" ? "Lightning" : "On-chain"}
            </SharpButton>
            <SimpleDialog
                title={i18n.t("receive.choose_payment_format")}
                open={methodChooserOpen()}
                setOpen={(open) => setMethodChooserOpen(open)}
            >
                <StyledRadioGroup
                    initialValue={props.flavor}
                    onValueChange={(flavor) => {
                        props.setFlavor(flavor);
                        setMethodChooserOpen(false);
                    }}
                    choices={RECEIVE_FLAVORS}
                    accent="white"
                    vertical
                    delayOnChange
                />
            </SimpleDialog>
        </>
    );
}

function ReceiveMethodHelp() {
    const i18n = useI18n();
    const [open, setOpen] = createSignal(false);
    return (
        <>
            <button class="flex gap-2 self-end" onClick={() => setOpen(true)}>
                <Users class="w-[18px]" />
                <CircleHelp class="w-[18px] text-m-grey-350" />
            </button>
            <SimpleDialog
                open={open()}
                setOpen={setOpen}
                title={i18n.t("receive.method_help.title")}
            >
                <p>{i18n.t("receive.method_help.body")}</p>
            </SimpleDialog>
        </>
    );
}

export function Receive() {
    const [state, _actions, sw] = useMegaStore();
    const navigate = useNavigate();
    const i18n = useI18n();

    const [amount, setAmount] = createSignal<bigint>(0n);
    const [whatForInput, setWhatForInput] = createSignal("");

    const [receiveState, setReceiveState] = createSignal<ReceiveState>("edit");
    // We use these for displaying the QR
    const [receiveStrings, setReceiveStrings] = createSignal<{
        lightning?: string;
        onchain?: string;
    }>();
    // We use these for checking the payment status
    const [rawReceiveStrings, setRawReceiveStrings] = createSignal<{
        bolt11?: string;
        address?: string;
    }>();

    const [lspFee, setLspFee] = createSignal(0n);

    // The data we get after a payment
    const [paymentTx, setPaymentTx] = createSignal<OnChainTx>();
    const [paymentInvoice, setPaymentInvoice] = createSignal<MutinyInvoice>();

    // The flavor of the receive
    const [flavor, setFlavor] = createSignal<ReceiveFlavor>("lightning");

    // loading state for the continue button
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<string>("");

    // Details Modal
    const [detailsOpen, setDetailsOpen] = createSignal(false);
    const [detailsKind, setDetailsKind] = createSignal<HackActivityType>();
    const [detailsId, setDetailsId] = createSignal<string>("");

    function clearAllButAmount() {
        setReceiveState("edit");
        setReceiveStrings(undefined);
        setPaymentTx(undefined);
        setPaymentInvoice(undefined);
        setError("");
    }

    function clearAll() {
        clearAllButAmount();
        setAmount(0n);
        setFlavor("lightning");
        setWhatForInput("");
    }

    function openDetailsModal() {
        const paymentTxId =
            paidState() === "onchain_paid"
                ? paymentTx()
                    ? paymentTx()?.internal_id
                    : undefined
                : paymentInvoice()
                  ? paymentInvoice()?.payment_hash
                  : undefined;
        const kind = paidState() === "onchain_paid" ? "OnChain" : "Lightning";

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

    const receiveTags = createMemo(() => {
        return whatForInput() ? [whatForInput().trim()] : [];
    });

    async function getLightningReceiveString(amount: bigint) {
        try {
            const inv = await sw.create_invoice(amount, receiveTags());

            const bolt11 = inv?.bolt11;
            setRawReceiveStrings({ bolt11 });

            return `lightning:${bolt11}`;
        } catch (e) {
            console.error(e);
        }
    }

    async function getOnchainReceiveString(amount?: bigint) {
        try {
            if (amount && amount < 546n) {
                throw new Error(i18n.t("receive.error_under_min_onchain"));
            }
            const raw = await sw.get_new_address(receiveTags());
            const address = raw?.address;

            if (amount && amount > 0n) {
                const btc_amount = await sw.convert_sats_to_btc(amount);
                const params = objectToSearchParams({
                    amount: btc_amount.toString()
                });
                setRawReceiveStrings({ address });
                return `bitcoin:${address}?${params}`;
            } else {
                setRawReceiveStrings({ address });
                return `bitcoin:${address}`;
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function onSubmit(e: Event) {
        e.preventDefault();

        await getQr();
    }

    async function getQr() {
        setLoading(true);
        try {
            if (flavor() === "lightning") {
                const lightning = await getLightningReceiveString(amount());
                setReceiveStrings({ lightning });
            }

            if (flavor() === "onchain") {
                const onchain = await getOnchainReceiveString(amount());
                setReceiveStrings({ onchain });
            }

            if (!receiveStrings()?.lightning && !receiveStrings()?.onchain) {
                throw new Error(i18n.t("receive.receive_strings_error"));
            }

            if (!error()) {
                setReceiveState("show");
            }
        } catch (e) {
            console.error(e);
            showToast(eify(e));
        }

        setLoading(false);
    }

    const qrString = createMemo(() => {
        if (receiveState() === "show") {
            if (flavor() === "lightning") {
                return receiveStrings()?.lightning;
            } else if (flavor() === "onchain") {
                return receiveStrings()?.onchain;
            }
        }
    });

    // Only copy the raw invoice string for lightning because the lightning prefix is not needed
    // for the onchain address we share the whole bip21 uri because it has more information
    const copyString = createMemo(() => {
        if (receiveState() === "show") {
            if (flavor() === "lightning") {
                return rawReceiveStrings()?.bolt11;
            } else if (flavor() === "onchain") {
                return receiveStrings()?.onchain;
            }
        }
    });

    async function checkIfPaid(receiveStrings?: {
        bolt11?: string;
        address?: string;
    }): Promise<PaidState | undefined> {
        if (receiveStrings) {
            const lightning = receiveStrings.bolt11;
            const address = receiveStrings.address;

            try {
                // Lightning invoice might be blank
                if (lightning) {
                    console.log("checking invoice", lightning);
                    const invoice = await sw.get_invoice(lightning);

                    // If the invoice has a fees amount that's probably the LSP fee
                    if (invoice?.fees_paid) {
                        setLspFee(invoice.fees_paid);
                    }

                    if (invoice && invoice.paid) {
                        setReceiveState("paid");
                        setPaymentInvoice(invoice);
                        await vibrateSuccess();
                        return "lightning_paid";
                    }
                }

                if (address) {
                    console.log("checking address", address);
                    const tx = await sw.check_address(address);

                    if (tx) {
                        setReceiveState("paid");
                        setPaymentTx(tx);
                        await vibrateSuccess();
                        return "onchain_paid";
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    const [paidState, { refetch }] = createResource(
        rawReceiveStrings,
        checkIfPaid
    );

    createEffect(() => {
        const interval = setInterval(() => {
            if (receiveState() === "show") refetch();
        }, 1000); // Poll every second
        if (receiveState() !== "show") {
            clearInterval(interval);
        }
        onCleanup(() => {
            clearInterval(interval);
        });
    });

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <Show when={receiveState() === "show"} fallback={<BackLink />}>
                    <BackButton
                        onClick={() => clearAllButAmount()}
                        title={i18n.t("receive.edit")}
                        showOnDesktop
                    />
                </Show>
                <LargeHeader
                    action={
                        receiveState() === "show" && (
                            <Indicator>{i18n.t("receive.checking")}</Indicator>
                        )
                    }
                >
                    {i18n.t("receive.receive_bitcoin")}
                </LargeHeader>
                <Switch>
                    <Match
                        when={!receiveStrings() || receiveState() === "edit"}
                    >
                        <div class="flex-1" />
                        <VStack>
                            <div class="mx-auto flex w-full max-w-[400px] flex-col items-center">
                                <AmountEditable
                                    initialAmountSats={amount() || "0"}
                                    setAmountSats={setAmount}
                                    onSubmit={getQr}
                                />
                                <FlavorChooser
                                    flavor={flavor()}
                                    setFlavor={setFlavor}
                                />
                            </div>
                            <ReceiveWarnings
                                amountSats={amount() || 0n}
                                from_fedi_to_ln={false}
                                flavor={flavor()}
                            />
                        </VStack>
                        <div class="flex-1" />
                        <VStack>
                            <Show
                                when={
                                    state.federations &&
                                    state.federations.length
                                }
                            >
                                <ReceiveMethodHelp />
                            </Show>
                            <form onSubmit={onSubmit}>
                                <SimpleInput
                                    type="text"
                                    value={whatForInput()}
                                    placeholder={i18n.t("receive.what_for")}
                                    onInput={(e) =>
                                        setWhatForInput(e.currentTarget.value)
                                    }
                                />
                            </form>
                            <Button
                                disabled={
                                    !amount() && !(flavor() === "onchain")
                                }
                                intent="green"
                                onClick={onSubmit}
                                loading={loading()}
                            >
                                {i18n.t("common.continue")}
                            </Button>
                        </VStack>
                    </Match>
                    <Match when={receiveStrings() && receiveState() === "show"}>
                        <FeeWarning fee={lspFee()} flavor={flavor()} />
                        <Show when={error()}>
                            <InfoBox accent="red">
                                <p>{error()}</p>
                            </InfoBox>
                        </Show>
                        <Show when={flavor() === "onchain"}>
                            <InfoBox accent="blue">
                                {i18n.t("receive.warning_address_reuse")}
                            </InfoBox>
                        </Show>
                        <IntegratedQr
                            value={qrString() ?? ""}
                            copyString={copyString()}
                            amountSats={amount() ? amount().toString() : "0"}
                            kind={flavor()}
                        />
                        <Show when={flavor() === "lightning"}>
                            <p class="text-center text-m-grey-350">
                                {i18n.t("receive.keep_mutiny_open")}
                            </p>
                        </Show>
                    </Match>
                    <Match when={receiveState() === "paid"}>
                        <SuccessModal
                            open={!!paidState()}
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
                                {receiveState() === "paid" &&
                                paidState() === "lightning_paid"
                                    ? i18n.t("receive.payment_received")
                                    : i18n.t("receive.payment_initiated")}
                            </h1>
                            <div class="flex flex-col items-center gap-1">
                                <div class="text-xl">
                                    <AmountSats
                                        amountSats={
                                            receiveState() === "paid" &&
                                            paidState() === "lightning_paid"
                                                ? paymentInvoice()?.amount_sats
                                                : paymentTx()?.received
                                        }
                                        icon="plus"
                                    />
                                </div>
                                <div class="text-white/70">
                                    <AmountFiat
                                        amountSats={
                                            receiveState() === "paid" &&
                                            paidState() === "lightning_paid"
                                                ? paymentInvoice()?.amount_sats
                                                : paymentTx()?.received
                                        }
                                        denominationSize="sm"
                                    />
                                </div>
                            </div>
                            <hr class="w-16 bg-m-grey-400" />
                            <Show
                                when={
                                    receiveState() === "paid" &&
                                    paidState() === "lightning_paid"
                                }
                            >
                                <Fee amountSats={lspFee()} />
                            </Show>
                            {/*TODO: Confirmation time estimate still not possible needs to be implemented in mutiny-node first*/}
                            <Show when={receiveState() === "paid"}>
                                <p
                                    class="cursor-pointer underline"
                                    onClick={openDetailsModal}
                                >
                                    {i18n.t("common.view_payment_details")}
                                </p>
                            </Show>
                        </SuccessModal>
                    </Match>
                </Switch>
            </DefaultMain>
            <NavBar activeTab="receive" />
        </MutinyWalletGuard>
    );
}
