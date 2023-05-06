import { MutinyBip21RawMaterials, MutinyInvoice } from "@mutinywallet/mutiny-wasm";
import { createEffect, createResource, createSignal, For, Match, onCleanup, Switch } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";
import { AmountEditable } from "~/components/AmountEditable";
import { Button, Card, LargeHeader, MutinyWalletGuard, SafeArea, SmallHeader } from "~/components/layout";
import NavBar from "~/components/NavBar";
import { useMegaStore } from "~/state/megaStore";
import { objectToSearchParams } from "~/utils/objectToSearchParams";
import { useCopy } from "~/utils/useCopy";
import mempoolTxUrl from "~/utils/mempoolTxUrl";

import party from '~/assets/hands/handsup.png';
import { Amount } from "~/components/Amount";
import { FullscreenModal } from "~/components/layout/FullscreenModal";
import { BackLink } from "~/components/layout/BackLink";
import { TagEditor, TagItem } from "~/components/TagEditor";
import { StyledRadioGroup } from "~/components/layout/Radio";
import { showToast } from "~/components/Toaster";

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

const createUniqueId = () => Math.random().toString(36).substr(2, 9);

const fakeContacts: TagItem[] = [
    { id: createUniqueId(), name: "Unknown", kind: "text" },
    { id: createUniqueId(), name: "Alice", kind: "contact" },
    { id: createUniqueId(), name: "Bob", kind: "contact" },
    { id: createUniqueId(), name: "Carol", kind: "contact" },
]

const RECEIVE_FLAVORS = [{ value: "unified", label: "Unified", caption: "Sender decides" }, { value: "lightning", label: "Lightning", caption: "Fast and cool" }, { value: "onchain", label: "On-chain", caption: "Just like Satoshi did it" }]

type ReceiveFlavor = "unified" | "lightning" | "onchain"

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
    const [receiveState, setReceiveState] = createSignal<ReceiveState>("edit")
    const [bip21Raw, setBip21Raw] = createSignal<MutinyBip21RawMaterials>();
    const [unified, setUnified] = createSignal("")

    // Tagging stuff
    const [selectedValues, setSelectedValues] = createSignal<TagItem[]>([]);
    const [values, setValues] = createSignal([...fakeContacts]);

    // The data we get after a payment
    const [paymentTx, setPaymentTx] = createSignal<OnChainTx>();
    const [paymentInvoice, setPaymentInvoice] = createSignal<MutinyInvoice>();

    // The flavor of the receive
    const [flavor, setFlavor] = createSignal<ReceiveFlavor>("unified");

    function clearAll() {
        setAmount("")
        setReceiveState("edit")
        setBip21Raw(undefined)
        setUnified("")
        setPaymentTx(undefined)
        setPaymentInvoice(undefined)
        setSelectedValues([])
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

    function handleCopy() {
        if (flavor() === "unified") {
            copy(unified() ?? "")
        } else if (flavor() === "lightning") {
            copy(bip21Raw()?.invoice ?? "")
        } else if (flavor() === "onchain") {
            copy(bip21Raw()?.address ?? "")
        }
    }

    async function getUnifiedQr(amount: string) {
        const bigAmount = BigInt(amount);
        try {
            const raw = await state.mutiny_wallet?.create_bip21(bigAmount);
            // Save the raw info so we can watch the address and invoice
            setBip21Raw(raw);

            const params = objectToSearchParams({
                amount: raw?.btc_amount,
                label: raw?.description,
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
                <main class="max-w-[600px] flex flex-col gap-4 mx-auto p-4">
                    <BackLink />
                    <LargeHeader>Receive Bitcoin</LargeHeader>
                    <Switch>
                        <Match when={!unified() || receiveState() === "edit"}>
                            <dl>
                                <dd>
                                    <AmountEditable initialAmountSats={amount() || "0"} setAmountSats={setAmount} />
                                </dd>
                                <dd>
                                    <TagEditor title="Tag the origin" values={values()} setValues={setValues} selectedValues={selectedValues()} setSelectedValues={setSelectedValues} />
                                </dd>

                            </dl>
                            <Button class="w-full" disabled={!amount() || !selectedValues().length} intent="green" onClick={onSubmit}>Create Invoice</Button>
                        </Match>
                        <Match when={unified() && receiveState() === "show"}>
                            <StyledRadioGroup small value={flavor()} onValueChange={setFlavor} choices={RECEIVE_FLAVORS} />
                            <div class="w-full bg-white rounded-xl">
                                <Switch>
                                    <Match when={flavor() === "unified"}>
                                        <QRCodeSVG value={unified() ?? ""} class="w-full h-full p-8 max-h-[400px]" />
                                    </Match>
                                    <Match when={flavor() === "lightning"}>
                                        <QRCodeSVG value={bip21Raw()?.invoice ?? ""} class="w-full h-full p-8 max-h-[400px]" />
                                    </Match>
                                    <Match when={flavor() === "onchain"}>
                                        <QRCodeSVG value={bip21Raw()?.address ?? ""} class="w-full h-full p-8 max-h-[400px]" />
                                    </Match>
                                </Switch>
                            </div>
                            <div class="flex gap-2 w-full">
                                <Button onClick={handleCopy}>{copied() ? "Copied" : "Copy"}</Button>
                                <ShareButton receiveString={unified() ?? ""} />
                            </div>
                            <Card>
                                <SmallHeader>Amount</SmallHeader>
                                <div class="flex justify-between">
                                    <Amount amountSats={parseInt(amount()) || 0} showFiat={true} />
                                    <button onClick={editAmount}>&#x270F;&#xFE0F;</button>
                                </div>
                                <SmallHeader>Tags</SmallHeader>
                                <div class="flex justify-between">
                                    <div class="flex flex-wrap">
                                        <For each={selectedValues()}>
                                            {(tag) => (
                                                <div class=" bg-white/20 rounded px-1">
                                                    {tag.name}
                                                </div>)}
                                        </For>
                                    </div>
                                    {/* <pre>{JSON.stringify(selectedValues(), null, 2)}</pre> */}
                                    <button onClick={editLabel}>&#x270F;&#xFE0F;</button>
                                </div>
                            </Card>
                            <Card title="Bip21">
                                <code class="break-all">{unified()}</code>
                            </Card>
                        </Match>
                        <Match when={receiveState() === "paid" && paidState() === "lightning_paid"}>
                            <FullscreenModal title="Payment Received" open={!!paidState()} setOpen={(open: boolean) => { if (!open) clearAll() }}>
                                <div class="flex flex-col items-center gap-8">
                                    <img src={party} alt="party" class="w-1/2 mx-auto max-w-[50vh]" />
                                    <Amount amountSats={paymentInvoice()?.amount_sats} showFiat />
                                </div>
                            </FullscreenModal>
                        </Match>
                        <Match when={receiveState() === "paid" && paidState() === "onchain_paid"}>
                            <FullscreenModal title="Payment Received" open={!!paidState()} setOpen={(open: boolean) => { if (!open) clearAll() }}>
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
                </main>
                <NavBar activeTab="receive" />
            </SafeArea >
        </MutinyWalletGuard>
    )
}