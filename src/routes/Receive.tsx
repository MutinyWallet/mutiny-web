import {
    MutinyBip21RawMaterials,
    MutinyInvoice
} from "@mutinywallet/mutiny-wasm";
import { useNavigate } from "@solidjs/router";
import { ArrowLeftRight } from "lucide-solid";
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
type ReceiveState = "edit" | "show" | "paid";
type PaidState = "lightning_paid" | "onchain_paid";

function FeeWarning(props: { fee: bigint; flavor: ReceiveFlavor }) {
    const i18n = useI18n();
    return (
        // TODO: probably won't always be fixed 2500?
        <Show when={props.fee > 1000n}>
            <Switch>
                <Match when={props.flavor === "unified"}>
                    <InfoBox accent="blue">
                        {i18n.t("receive.unified_setup_fee", {
                            amount: props.fee.toLocaleString()
                        })}
                        <FeesModal />
                    </InfoBox>
                </Match>
                <Match when={props.flavor === "lightning"}>
                    <InfoBox accent="blue">
                        {i18n.t("receive.lightning_setup_fee", {
                            amount: props.fee.toLocaleString()
                        })}
                        <FeesModal />
                    </InfoBox>
                </Match>
            </Switch>
        </Show>
    );
}

export function Receive() {
    const [state, actions] = useMegaStore();
    const navigate = useNavigate();
    const i18n = useI18n();

    const [amount, setAmount] = createSignal<bigint>(0n);
    const [whatForInput, setWhatForInput] = createSignal("");

    const [receiveState, setReceiveState] = createSignal<ReceiveState>("edit");
    const [bip21Raw, setBip21Raw] = createSignal<MutinyBip21RawMaterials>();
    const [unified, setUnified] = createSignal("");

    const [lspFee, setLspFee] = createSignal(0n);

    // The data we get after a payment
    const [paymentTx, setPaymentTx] = createSignal<OnChainTx>();
    const [paymentInvoice, setPaymentInvoice] = createSignal<MutinyInvoice>();

    // The flavor of the receive (defaults to unified)
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

    const RECEIVE_FLAVORS = [
        {
            value: "unified",
            label: i18n.t("receive.unified_label"),
            caption: i18n.t("receive.unified_caption")
        },
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

    const [rememberChoice, setRememberChoice] = createSignal(false);

    const receiveString = createMemo(() => {
        if (unified() && receiveState() === "show") {
            if (flavor() === "unified") {
                return unified();
            } else if (flavor() === "lightning") {
                return bip21Raw()?.invoice ?? "";
            } else if (flavor() === "onchain") {
                return bip21Raw()?.address ?? "";
            }
        }
    });

    function clearAll() {
        setAmount(0n);
        setReceiveState("edit");
        setBip21Raw(undefined);
        setUnified("");
        setPaymentTx(undefined);
        setPaymentInvoice(undefined);
        setError("");
        setFlavor(state.preferredInvoiceType);
    }

    function openDetailsModal() {
        const paymentTxId =
            paidState() === "onchain_paid"
                ? paymentTx()
                    ? paymentTx()?.txid
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

    async function getUnifiedQr(amount: bigint) {
        console.log("get unified amount", amount);
        const bigAmount = BigInt(amount);
        setLoading(true);

        // Both paths use tags so we'll do this once
        let tags;

        try {
            tags = whatForInput() ? [whatForInput().trim()] : [];
        } catch (e) {
            showToast(eify(e));
            console.error(e);
            setLoading(false);
            return;
        }

        // Happy path
        // First we try to get both an invoice and an address
        try {
            console.log("big amount", bigAmount);
            const raw = await state.mutiny_wallet?.create_bip21(
                bigAmount,
                tags
            );
            // Save the raw info so we can watch the address and invoice
            setBip21Raw(raw);

            console.log("raw", raw);

            const params = objectToSearchParams({
                amount: raw?.btc_amount,
                lightning: raw?.invoice
            });

            setLoading(false);
            return `bitcoin:${raw?.address}?${params}`;
        } catch (e) {
            console.error(e);
            if (e === "Satoshi amount is invalid") {
                setError(i18n.t("receive.error_under_min_lightning"));
            } else {
                setError(i18n.t("receive.error_creating_unified"));
            }
        }

        // If we didn't return before this, that means create_bip21 failed
        // So now we'll just try and get an address without the invoice
        try {
            const raw = await state.mutiny_wallet?.get_new_address(tags);

            // Save the raw info so we can watch the address
            setBip21Raw(raw);

            setFlavor("onchain");

            // We won't meddle with a "unified" QR here
            return raw?.address;
        } catch (e) {
            // If THAT failed we're really screwed
            showToast(eify(i18n.t("receive.error_creating_address")));
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function onSubmit(e: Event) {
        e.preventDefault();

        await getQr();
    }

    async function getQr() {
        if (amount()) {
            const unifiedQr = await getUnifiedQr(amount());

            setUnified(unifiedQr || "");
            setReceiveState("show");
        }
    }

    async function checkIfPaid(
        bip21?: MutinyBip21RawMaterials
    ): Promise<PaidState | undefined> {
        if (bip21) {
            console.debug("checking if paid...");
            const lightning = bip21.invoice;
            const address = bip21.address;

            try {
                // Lightning invoice might be blank
                if (lightning) {
                    const invoice =
                        await state.mutiny_wallet?.get_invoice(lightning);

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

                const tx = (await state.mutiny_wallet?.check_address(
                    address
                )) as OnChainTx | undefined;

                if (tx) {
                    setReceiveState("paid");
                    setPaymentTx(tx);
                    await vibrateSuccess();
                    return "onchain_paid";
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    function selectFlavor(flavor: string) {
        setFlavor(flavor as ReceiveFlavor);
        if (rememberChoice()) {
            actions.setPreferredInvoiceType(flavor as ReceiveFlavor);
        }
        setMethodChooserOpen(false);
    }

    const [paidState, { refetch }] = createResource(bip21Raw, checkIfPaid);

    createEffect(() => {
        const interval = setInterval(() => {
            if (receiveState() === "show") refetch();
        }, 1000); // Poll every second
        onCleanup(() => {
            clearInterval(interval);
        });
    });

    const [methodChooserOpen, setMethodChooserOpen] = createSignal(false);

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <Show when={receiveState() === "show"} fallback={<BackLink />}>
                    <BackButton
                        onClick={() => clearAll()}
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
                    <Match when={!unified() || receiveState() === "edit"}>
                        <div class="flex-1" />
                        <VStack>
                            <AmountEditable
                                initialAmountSats={amount() || "0"}
                                setAmountSats={setAmount}
                                onSubmit={getQr}
                            />
                            <ReceiveWarnings
                                amountSats={amount() || "0"}
                                from_fedi_to_ln={false}
                            />
                        </VStack>
                        <div class="flex-1" />
                        <VStack>
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
                                disabled={!amount()}
                                intent="green"
                                onClick={onSubmit}
                                loading={loading()}
                            >
                                {i18n.t("common.continue")}
                            </Button>
                        </VStack>
                    </Match>
                    <Match when={unified() && receiveState() === "show"}>
                        <FeeWarning fee={lspFee()} flavor={flavor()} />
                        <Show when={error()}>
                            <InfoBox accent="red">
                                <p>{error()}</p>
                            </InfoBox>
                        </Show>
                        <IntegratedQr
                            value={receiveString() ?? ""}
                            amountSats={amount() ? amount().toString() : "0"}
                            kind={flavor()}
                        />
                        <p class="text-center text-neutral-400">
                            {i18n.t("receive.keep_mutiny_open")}
                        </p>
                        {/* Only show method chooser when we have an invoice */}
                        <Show when={bip21Raw()?.invoice}>
                            <button
                                class="mx-auto flex items-center gap-2 pb-8 font-bold text-m-grey-400"
                                onClick={() => setMethodChooserOpen(true)}
                            >
                                <span>{i18n.t("receive.choose_format")}</span>
                                <ArrowLeftRight class="h-4 w-4" />
                            </button>
                            <SimpleDialog
                                title={i18n.t("receive.choose_payment_format")}
                                open={methodChooserOpen()}
                                setOpen={(open) => setMethodChooserOpen(open)}
                            >
                                <StyledRadioGroup
                                    initialValue={flavor()}
                                    onValueChange={selectFlavor}
                                    choices={RECEIVE_FLAVORS}
                                    accent="white"
                                    vertical
                                    delayOnChange
                                />
                                <Checkbox
                                    label={i18n.t("receive.remember_choice")}
                                    checked={rememberChoice()}
                                    onChange={setRememberChoice}
                                />
                            </SimpleDialog>
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
