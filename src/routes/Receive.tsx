import { TextField } from "@kobalte/core";
import { MutinyBip21RawMaterials, MutinyInvoice } from "@mutinywallet/mutiny-wasm";
import { createEffect, createMemo, createResource, createSignal, Match, onCleanup, Switch } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";
import { AmountEditable } from "~/components/AmountEditable";
import { Button, Card, DefaultMain, LargeHeader, NodeManagerGuard, SafeArea, SmallHeader } from "~/components/layout";
import NavBar from "~/components/NavBar";
import { useMegaStore } from "~/state/megaStore";
import { satsToUsd } from "~/utils/conversions";
import { objectToSearchParams } from "~/utils/objectToSearchParams";
import { useCopy } from "~/utils/useCopy";
import mempoolTxUrl from "~/utils/mempoolTxUrl";

import party from '~/assets/party.gif';
import { Amount } from "~/components/Amount";
import { FullscreenModal } from "~/components/layout/FullscreenModal";

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

function ShareButton(props: { receiveString: string }) {
    async function share(receiveString: string) {
        // If the browser doesn't support share we can just copy the address
        if (!navigator.share) {
            console.error("Share not supported")
        }
        const shareData: ShareData = {
            title: "Mutiny Wallet",
            text: receiveString,
        }
        try {
            await navigator.share(shareData)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <Button onClick={(_) => share(props.receiveString)}>Share</Button>
    )
}

type ReceiveState = "edit" | "show" | "paid"
type PaidState = "lightning_paid" | "onchain_paid";

export default function Receive() {
    const [state, _] = useMegaStore()

    const [amount, setAmount] = createSignal("")
    const [label, setLabel] = createSignal("")

    const [receiveState, setReceiveState] = createSignal<ReceiveState>("edit")

    const [bip21Raw, setBip21Raw] = createSignal<MutinyBip21RawMaterials>();

    const [unified, setUnified] = createSignal("")

    // The data we get after a payment
    const [paymentTx, setPaymentTx] = createSignal<OnChainTx>();
    const [paymentInvoice, setPaymentInvoice] = createSignal<MutinyInvoice>();

    function clearAll() {
        setAmount("")
        setLabel("")
        setReceiveState("edit")
        setBip21Raw(undefined)
        setUnified("")
        setPaymentTx(undefined)
        setPaymentInvoice(undefined)
    }

    let amountInput!: HTMLInputElement;
    let labelInput!: HTMLInputElement;

    function editAmount(e: Event) {
        e.preventDefault();
        setReceiveState("edit")
        amountInput.focus();
    }

    function editLabel(e: Event) {
        e.preventDefault();
        setReceiveState("edit")
        labelInput.focus();
    }



    const [copy, copied] = useCopy({ copiedTimeout: 1000 });

    async function getUnifiedQr(amount: string, label: string) {
        const bigAmount = BigInt(amount);
        const raw = await state.node_manager?.create_bip21(bigAmount, label);

        // Save the raw info so we can watch the address and invoice
        setBip21Raw(raw);

        const params = objectToSearchParams({
            amount: raw?.btc_amount,
            label: raw?.description,
            lightning: raw?.invoice
        })

        return `bitcoin:${raw?.address}?${params}`
    }

    async function onSubmit(e: Event) {
        e.preventDefault();

        const unifiedQr = await getUnifiedQr(amount(), label())

        setUnified(unifiedQr)
        setReceiveState("show")
    }

    const amountInUsd = createMemo(() => satsToUsd(state.price, parseInt(amount()) || 0, true))

    function handleAmountSave() {
        console.error("focusing label input...")
        console.error(labelInput)
        labelInput.focus();
    }

    async function checkIfPaid(bip21?: MutinyBip21RawMaterials): Promise<PaidState | undefined> {
        if (bip21) {
            console.log("checking if paid...")
            const lightning = bip21.invoice
            const address = bip21.address

            const invoice = await state.node_manager?.get_invoice(lightning)

            if (invoice && invoice.paid) {
                setReceiveState("paid")
                setPaymentInvoice(invoice)
                return "lightning_paid"
            }

            const tx = await state.node_manager?.check_address(address) as OnChainTx | undefined;

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
        <NodeManagerGuard>
            <SafeArea>
                <DefaultMain>
                    <LargeHeader>Receive Bitcoin</LargeHeader>
                    <Switch>
                        <Match when={!unified() || receiveState() === "edit"}>
                            <AmountEditable initialAmountSats={amount() || "0"} setAmountSats={setAmount} onSave={handleAmountSave} />
                            <div>
                                <Button intent="glowy" layout="xs">Tag the sender</Button>
                            </div>
                            <form class="flex flex-col gap-4" onSubmit={onSubmit} >
                                <TextField.Root
                                    value={label()}
                                    onValueChange={setLabel}
                                    class="flex flex-col gap-2"
                                >
                                    <TextField.Label><SmallHeader>Label (private)</SmallHeader></TextField.Label>
                                    <TextField.Input
                                        ref={el => labelInput = el}
                                        class="w-full p-2 rounded-lg text-black" />
                                </TextField.Root>
                                <Button disabled={!amount() || !label()} intent="green" type="submit">Create Invoice</Button>
                            </form >
                        </Match>
                        <Match when={unified() && receiveState() === "show"}>
                            <div class="w-full bg-white rounded-xl">
                                <QRCodeSVG value={unified() ?? ""} class="w-full h-full p-8 max-h-[400px]" />
                            </div>
                            <div class="flex gap-2 w-full">
                                <Button onClick={(_) => copy(unified() ?? "")}>{copied() ? "Copied" : "Copy"}</Button>
                                <ShareButton receiveString={unified() ?? ""} />
                            </div>
                            <Card>
                                <SmallHeader>Amount</SmallHeader>
                                <div class="flex justify-between">
                                    <p>{amount()} sats</p><button onClick={editAmount}>&#x270F;&#xFE0F;</button>
                                </div>
                                <pre>({amountInUsd()})</pre>
                                <SmallHeader>Private Label</SmallHeader>
                                <div class="flex justify-between">
                                    <p>{label()} </p><button onClick={editLabel}>&#x270F;&#xFE0F;</button>
                                </div>
                            </Card>
                            <Card title="Bip21">
                                <code class="break-all">{unified()}</code>
                            </Card>
                        </Match>
                        <Match when={receiveState() === "paid" && paidState() === "lightning_paid"}>
                            <FullscreenModal title="Payment Received!" open={!!paidState()} setOpen={(open: boolean) => { if (!open) clearAll() }}>
                                <div class="flex flex-col items-center gap-8">
                                    <img src={party} alt="party" class="w-1/2 mx-auto max-w-[50vh] aspect-square" />
                                    <Amount amountSats={paymentInvoice()?.amount_sats} showFiat />
                                </div>
                            </FullscreenModal>
                        </Match>
                        <Match when={receiveState() === "paid" && paidState() === "onchain_paid"}>
                            <FullscreenModal title="Payment Received!" open={!!paidState()} setOpen={(open: boolean) => { if (!open) clearAll() }}>
                                <div class="flex flex-col items-center gap-8">
                                    <img src={party} alt="party" class="w-1/2 mx-auto max-w-[50vh] aspect-square" />
                                    <Amount amountSats={paymentTx()?.received} showFiat />
                                    <a href={mempoolTxUrl(paymentTx()?.txid, "signet")} target="_blank" rel="noreferrer">
                                        Mempool Link
                                    </a>
                                </div>
                            </FullscreenModal>
                        </Match>
                    </Switch>
                </DefaultMain>
                <NavBar activeTab="none" />
            </SafeArea >
        </NodeManagerGuard>
    )
}