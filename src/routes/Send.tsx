import { TextField } from "@kobalte/core";
import { Match, Show, Switch, createEffect, createMemo, createResource, createSignal, onCleanup, onMount } from "solid-js";
import { Amount } from "~/components/Amount";
import NavBar from "~/components/NavBar";
import { Button, ButtonLink, DefaultMain, LargeHeader, NodeManagerGuard, SafeArea, SmallHeader } from "~/components/layout";
import { Paste } from "~/assets/svg/Paste";
import { Scan } from "~/assets/svg/Scan";
import { useMegaStore } from "~/state/megaStore";
import { MutinyInvoice } from "@mutinywallet/mutiny-wasm";
import { AmountEditable } from "~/components/AmountEditable";
import { StyledRadioGroup } from "~/components/layout/Radio";
import { ParsedParams, toParsedParams } from "./Scanner";
import init from "@mutinywallet/waila-wasm";
import { showToast } from "~/components/Toaster";
import eify from "~/utils/eify";
import { FullscreenModal } from "~/components/layout/FullscreenModal";
import handshake from "~/assets/handshake.png";
import mempoolTxUrl from "~/utils/mempoolTxUrl";
import { BackButton } from "~/components/layout/BackButton";

type SendSource = "lightning" | "onchain";

const PAYMENT_METHODS = [{ value: "lightning", label: "Lightning", caption: "Fast and cool" }, { value: "onchain", label: "On-chain", caption: "Just like Satoshi did it" }]

// const TEST_DEST = "bitcoin:tb1pdh43en28jmhnsrhxkusja46aufdlae5qnfrhucw5jvefw9flce3sdxfcwe?amount=0.00001&label=heyo&lightning=lntbs10u1pjrwrdedq8dpjhjmcnp4qd60w268ve0jencwzhz048ruprkxefhj0va2uspgj4q42azdg89uupp5gngy2pqte5q5uvnwcxwl2t8fsdlla5s6xl8aar4xcsvxeus2w2pqsp5n5jp3pz3vpu92p3uswttxmw79a5lc566herwh3f2amwz2sp6f9tq9qyysgqcqpcxqrpwugv5m534ww5ukcf6sdw2m75f2ntjfh3gzeqay649256yvtecgnhjyugf74zakaf56sdh66ec9fqep2kvu6xv09gcwkv36rrkm38ylqsgpw3yfjl"
// const TEST_DEST_ADDRESS = "tb1pdh43en28jmhnsrhxkusja46aufdlae5qnfrhucw5jvefw9flce3sdxfcwe"

type SentDetails = { amount: bigint, destination: string, txid?: string }

export default function Send() {
    let waila;

    onMount(() => {
        init().then((w) => {
            waila = w;
        });

    })

    // TODO: Is this just implied?
    onCleanup(() => {
        waila = undefined;
    })

    const [state, actions] = useMegaStore();

    // These can only be set by the user
    const [destination, setDestination] = createSignal<ParsedParams>();
    const [privateLabel, setPrivateLabel] = createSignal("");

    // These can be derived from the "destination" signal or set by the user
    const [amountSats, setAmountSats] = createSignal(0n);
    const [source, setSource] = createSignal<SendSource>("lightning");

    // These can only be derived from the "destination" signal
    const [invoice, setInvoice] = createSignal<MutinyInvoice>();
    const [address, setAddress] = createSignal<string>();
    const [description, setDescription] = createSignal<string>();

    // Is sending / sent
    const [sending, setSending] = createSignal(false);
    const [sentDetails, setSentDetails] = createSignal<SentDetails>();

    function clearAll() {
        setDestination(undefined);
        setPrivateLabel("");
        setAmountSats(0n);
        setSource("lightning");
        setInvoice(undefined);
        setAddress(undefined);
        setDescription(undefined);
    }

    const fakeFee = createMemo(() => {
        if (source() === "lightning") return 69n;
        if (source() === "onchain") return 420n;
        return 0n;
    })

    onMount(() => {
        if (state.scan_result) {
            setDestination(state.scan_result);
        }
    })

    // Rerun every time the destination changes
    createEffect(() => {
        const source = destination();
        console.log(source)
        if (!source) return undefined;
        try {
            if (source.address) setAddress(source.address)
            if (source.memo) setDescription(source.memo);

            if (source.invoice) {
                state.node_manager?.decode_invoice(source.invoice).then(invoice => {
                    if (invoice?.amount_sats) setAmountSats(invoice.amount_sats);
                    setInvoice(invoice)
                    setSource("lightning")
                });
            } else {
                setAmountSats(source.amount_sats || 0n);
                setSource("onchain")
            }
            // Return the source just to trigger `decodedDestination` as not undefined
            return source
        } catch (e) {
            console.error("error", e)
            clearAll();
        }
    })

    function handlePaste() {
        navigator.clipboard.readText().then(text => {
            if (text) {
                const network = state.node_manager?.get_network() || "signet";
                const result = toParsedParams(text || "", network);
                if (!result.ok) {
                    showToast(result.error);
                    return;
                } else {
                    if (result.value?.address || result.value?.invoice) {
                        setDestination(result.value);
                        // Important! we need to clear the scan result once we've used it
                        actions.setScanResult(undefined);
                    }
                }
            }
        });
    }

    async function handleSend() {
        try {
            setSending(true);
            const bolt11 = invoice()?.bolt11;
            let sentDetails: Partial<SentDetails> = {};
            if (source() === "lightning" && invoice() && bolt11) {
                const nodes = await state.node_manager?.list_nodes();
                const firstNode = nodes[0] as string || ""
                sentDetails.destination = bolt11;
                // If the invoice has sats use that, otherwise we pass the user-defined amount
                if (invoice()?.amount_sats) {
                    await state.node_manager?.pay_invoice(firstNode, bolt11);
                    sentDetails.amount = invoice()?.amount_sats;
                } else {
                    await state.node_manager?.pay_invoice(firstNode, bolt11, amountSats());
                    sentDetails.amount = amountSats();
                }
            } else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const txid = await state.node_manager?.send_to_address(address()!, amountSats());
                sentDetails.amount = amountSats();
                sentDetails.destination = address();
                // TODO: figure out if this is necessary, it takes forever
                await actions.sync();
                sentDetails.txid = txid;
            }
            setSentDetails(sentDetails as SentDetails);
            clearAll();
        } catch (e) {
            showToast(eify(e))
            console.error(e);
        } finally {
            setSending(false);
        }
    }

    return (
        <NodeManagerGuard>
            <SafeArea>
                <DefaultMain>
                    <BackButton />
                    <LargeHeader>Send Bitcoin</LargeHeader>
                    {/* <SentModal details={sentDetails()} /> */}
                    <FullscreenModal title="Sent!" open={!!sentDetails()} setOpen={(open: boolean) => { if (!open) setSentDetails(undefined) }} onConfirm={() => setSentDetails(undefined)}>
                        <div class="flex flex-col items-center gap-8">
                            <img src={handshake} alt="party" class="w-1/2 mx-auto max-w-[50vh] zoom-image" />
                            <Amount amountSats={sentDetails()?.amount} showFiat />
                            <Show when={sentDetails()?.txid}>
                                <a href={mempoolTxUrl(sentDetails()?.txid, state.node_manager?.get_network())} target="_blank" rel="noreferrer">
                                    Mempool Link
                                </a>
                            </Show>
                        </div>
                    </FullscreenModal>
                    <dl>
                        <dt>
                            <SmallHeader>Destination</SmallHeader>
                        </dt>
                        <dd>
                            <Switch>
                                <Match when={address() || invoice()}>
                                    <div class="flex gap-2 items-center">
                                        <Show when={address() && source() === "onchain"}>
                                            <code class="truncate text-sm break-all">{"Address: "} {address()}
                                                <Show when={description()}>
                                                    <br />
                                                    {"Description:"} {description()}
                                                </Show>
                                            </code>
                                        </Show>
                                        <Show when={invoice() && source() === "lightning"}>
                                            <code class="truncate text-sm break-all">{"Invoice: "} {invoice()?.bolt11}
                                                <Show when={description()}>
                                                    <br />
                                                    {"Description:"} {description()}
                                                </Show>
                                            </code>
                                        </Show>
                                        <Button class="flex-0" intent="glowy" layout="xs" onClick={clearAll}>Clear</Button>
                                    </div>
                                    <div class="my-8 flex gap-4 w-full items-center justify-around">
                                        {/* if the amount came with the invoice we can't allow setting it */}
                                        <Show when={!(invoice()?.amount_sats)} fallback={<Amount amountSats={amountSats() || 0} showFiat />}>
                                            <AmountEditable initialAmountSats={amountSats().toString() || "0"} setAmountSats={setAmountSats} />
                                        </Show>
                                        <div class="bg-white/10 px-4 py-2 rounded-xl">
                                            <div class="flex gap-2 items-center">
                                                <h2 class="text-neutral-400 font-semibold uppercase">+ Fee</h2>
                                                <h3 class="text-xl font-light text-neutral-300">
                                                    {fakeFee().toLocaleString()} <span class='text-lg'>SATS</span>
                                                </h3>
                                            </div>
                                            <div class="flex gap-2 items-center">
                                                <h2 class="font-semibold uppercase text-white">Total</h2>
                                                <h3 class="text-xl font-light text-white">
                                                    {(amountSats().valueOf() + fakeFee().valueOf()).toLocaleString()} <span class='text-lg'>SATS</span>
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                </Match>
                                <Match when={true}>
                                    <div class="flex flex-row gap-4">
                                        <Button onClick={handlePaste}>
                                            <div class="flex flex-col gap-2 items-center">
                                                <Paste />
                                                <span>Paste</span>
                                            </div>
                                        </Button>
                                        <ButtonLink href="/scanner">
                                            <div class="flex flex-col gap-2 items-center">
                                                <Scan />
                                                <span>Scan QR</span>
                                            </div>
                                        </ButtonLink>
                                    </div>
                                </Match>
                            </Switch>
                        </dd>
                        <Show when={address() && invoice()}>
                            <dt>
                                <SmallHeader>
                                    Payment Method
                                </SmallHeader>
                            </dt>
                            <dd>
                                <StyledRadioGroup value={source()} onValueChange={setSource} choices={PAYMENT_METHODS} />
                            </dd>
                        </Show>
                        <Show when={destination()}>
                            <TextField.Root
                                value={privateLabel()}
                                onValueChange={setPrivateLabel}
                                class="flex flex-col gap-2"
                            >
                                <dt>
                                    <SmallHeader>
                                        <TextField.Label>Label (private)</TextField.Label>
                                    </SmallHeader>
                                </dt>
                                <dd>
                                    <TextField.Input
                                        autofocus
                                        class="w-full p-2 rounded-lg bg-white/10"
                                        placeholder="A helpful reminder of why you spent bitcoin"
                                    />
                                </dd>
                            </TextField.Root>
                        </Show>
                    </dl>
                    <Button disabled={!destination() || sending()} intent="blue" onClick={handleSend} loading={sending()}>{sending() ? "Sending..." : "Confirm Send"}</Button>
                </DefaultMain>
                <NavBar activeTab="send" />
            </SafeArea >
        </NodeManagerGuard>
    )
}