import { Contact, MutinyBip21RawMaterials, MutinyInvoice } from "@mutinywallet/mutiny-wasm";
import { createEffect, createMemo, createResource, createSignal, Match, onCleanup, onMount, Show, Switch } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";
import { Button, Card, DefaultMain, Indicator, LargeHeader, MutinyWalletGuard, SafeArea } from "~/components/layout";
import NavBar from "~/components/NavBar";
import { useMegaStore } from "~/state/megaStore";
import { objectToSearchParams } from "~/utils/objectToSearchParams";
import mempoolTxUrl from "~/utils/mempoolTxUrl";
import { Amount } from "~/components/Amount";
import { FullscreenModal } from "~/components/layout/FullscreenModal";
import { BackLink } from "~/components/layout/BackLink";
import { TagEditor } from "~/components/TagEditor";
import { StyledRadioGroup } from "~/components/layout/Radio";
import { showToast } from "~/components/Toaster";
import { useNavigate } from "solid-start";
import megacheck from "~/assets/icons/megacheck.png";
import { AmountCard } from "~/components/AmountCard";
import { ShareCard } from "~/components/ShareCard";
import { BackButton } from "~/components/layout/BackButton";
import { MutinyTagItem } from "~/utils/tags";

type OnChainTx = {
    transaction: {
        version: number
        lock_time: number
        input: Array<{
            previous_output: string
            script_sig: string
            sequence: number
            witness: Array<string>
        }>
        output: Array<{
            value: number
            script_pubkey: string
        }>
    }
    txid: string
    received: number
    sent: number
    confirmation_time: {
        height: number
        timestamp: number
    }
}

const RECEIVE_FLAVORS = [{ value: "unified", label: "Unified", caption: "Sender decides" }, { value: "lightning", label: "Lightning", caption: "Fast and cool" }, { value: "onchain", label: "On-chain", caption: "Just like Satoshi did it" }]

type ReceiveFlavor = "unified" | "lightning" | "onchain"
type ReceiveState = "edit" | "show" | "paid"
type PaidState = "lightning_paid" | "onchain_paid";

export default function Receive() {
    const [state, actions] = useMegaStore()
    const navigate = useNavigate();

    const [amount, setAmount] = createSignal("")
    const [receiveState, setReceiveState] = createSignal<ReceiveState>("edit")
    const [bip21Raw, setBip21Raw] = createSignal<MutinyBip21RawMaterials>();
    const [unified, setUnified] = createSignal("")
    const [shouldShowAmountEditor, setShouldShowAmountEditor] = createSignal(true)

    // Tagging stuff
    const [selectedValues, setSelectedValues] = createSignal<MutinyTagItem[]>([]);

    // The data we get after a payment
    const [paymentTx, setPaymentTx] = createSignal<OnChainTx>();
    const [paymentInvoice, setPaymentInvoice] = createSignal<MutinyInvoice>();

    // The flavor of the receive
    const [flavor, setFlavor] = createSignal<ReceiveFlavor>("unified");

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
    })

    function clearAll() {
        setAmount("")
        setReceiveState("edit")
        setBip21Raw(undefined)
        setUnified("")
        setPaymentTx(undefined)
        setPaymentInvoice(undefined)
        setSelectedValues([])
    }

    async function processContacts(contacts: Partial<MutinyTagItem>[]): Promise<string[]> {
        console.log("Processing contacts", contacts)

        if (contacts.length) {
            const first = contacts![0];

            if (!first.name) {
                console.error("Something went wrong with contact creation, proceeding anyway")
                return []
            }

            if (!first.id && first.name) {
                console.error("Creating new contact", first.name)
                const c = new Contact(first.name, undefined, undefined, undefined);
                const newContactId = await state.mutiny_wallet?.create_new_contact(c);
                if (newContactId) {
                    return [newContactId];
                }
            }

            if (first.id) {
                console.error("Using existing contact", first.name, first.id)
                return [first.id];
            }

        }

        console.error("Something went wrong with contact creation, proceeding anyway")
        return []

    }

    async function getUnifiedQr(amount: string) {
        const bigAmount = BigInt(amount);
        try {
            const tags = await processContacts(selectedValues());
            const raw = await state.mutiny_wallet?.create_bip21(bigAmount, tags);
            // Save the raw info so we can watch the address and invoice
            setBip21Raw(raw);

            const params = objectToSearchParams({
                amount: raw?.btc_amount,
                lightning: raw?.invoice
            })

            return `bitcoin:${raw?.address}?${params}`

        } catch (e) {
            showToast(new Error("Couldn't create invoice. Are you asking for enough?"))
            console.error(e)
        }
    }

    async function onSubmit(e: Event) {
        e.preventDefault();

        const unifiedQr = await getUnifiedQr(amount())

        setUnified(unifiedQr || "")
        setReceiveState("show")
        setShouldShowAmountEditor(false)
    }

    async function checkIfPaid(bip21?: MutinyBip21RawMaterials): Promise<PaidState | undefined> {
        if (bip21) {
            console.log("checking if paid...")
            const lightning = bip21.invoice
            const address = bip21.address

            const invoice = await state.mutiny_wallet?.get_invoice(lightning)

            if (invoice && invoice.paid) {
                setReceiveState("paid")
                setPaymentInvoice(invoice)
                return "lightning_paid"
            }

            const tx = await state.mutiny_wallet?.check_address(address) as OnChainTx | undefined;

            if (tx) {
                setReceiveState("paid")
                setPaymentTx(tx)
                return "onchain_paid"
            }
        }
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

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <Show when={receiveState() === "show"} fallback={<BackLink />}>
                        <BackButton onClick={() => setReceiveState("edit")} title="Edit" />
                    </Show>
                    <LargeHeader action={receiveState() === "show" && <Indicator>Checking</Indicator>}>Receive Bitcoin</LargeHeader>
                    <Switch>
                        <Match when={!unified() || receiveState() === "edit"}>
                            <div class="flex flex-col flex-1 gap-8">
                                <AmountCard initialOpen={shouldShowAmountEditor()} amountSats={amount() || "0"} setAmountSats={setAmount} isAmountEditable />

                                <Card title="Private tags">
                                    <TagEditor selectedValues={selectedValues()} setSelectedValues={setSelectedValues} placeholder="Add the sender for your records" />
                                </Card>

                                <div class="flex-1" />
                                <Button class="w-full flex-grow-0" disabled={!amount()} intent="green" onClick={onSubmit}>Create Request</Button>
                            </div>
                        </Match>
                        <Match when={unified() && receiveState() === "show"}>
                            <StyledRadioGroup small value={flavor()} onValueChange={setFlavor} choices={RECEIVE_FLAVORS} accent="white" />
                            <div class="w-full bg-white rounded-xl">
                                <QRCodeSVG value={receiveString() ?? ""} class="w-full h-full p-8 max-h-[400px]" />
                            </div>
                            <p class="text-neutral-400 text-center">Show or share this code with the sender</p>
                            <ShareCard text={receiveString() ?? ""} />
                        </Match>
                        <Match when={receiveState() === "paid" && paidState() === "lightning_paid"}>
                            <FullscreenModal
                                title="Payment Received"
                                open={!!paidState()}
                                setOpen={(open: boolean) => { if (!open) clearAll() }}
                                onConfirm={() => { clearAll(); navigate("/"); }}
                            >
                                <div class="flex flex-col items-center gap-8">
                                    <img src={megacheck} alt="success" class="w-1/2 mx-auto max-w-[50vh] aspect-square" />
                                    <Amount amountSats={paymentInvoice()?.amount_sats} showFiat />
                                </div>
                            </FullscreenModal>
                        </Match>
                        <Match when={receiveState() === "paid" && paidState() === "onchain_paid"}>
                            <FullscreenModal
                                title="Payment Received"
                                open={!!paidState()}
                                setOpen={(open: boolean) => { if (!open) clearAll() }}
                                onConfirm={() => { clearAll(); navigate("/"); }}
                            >
                                <div class="flex flex-col items-center gap-8">
                                    <img src={megacheck} alt="success" class="w-1/2 mx-auto max-w-[50vh] aspect-square" />
                                    <Amount amountSats={paymentTx()?.received} showFiat />
                                    <a href={mempoolTxUrl(paymentTx()?.txid, "signet")} target="_blank" rel="noreferrer">
                                        Mempool Link
                                    </a>
                                </div>
                            </FullscreenModal>
                        </Match>
                    </Switch>
                </DefaultMain>
                <NavBar activeTab="receive" />
            </SafeArea >
        </MutinyWalletGuard>
    )
}