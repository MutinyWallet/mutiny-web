import { Match, Show, Switch, createEffect, createMemo, createResource, createSignal, onCleanup, onMount } from "solid-js";
import { Amount } from "~/components/Amount";
import NavBar from "~/components/NavBar";
import { Button, ButtonLink, DefaultMain, HStack, LargeHeader, NodeManagerGuard, SafeArea, SmallHeader, VStack } from "~/components/layout";
import { Paste } from "~/assets/svg/Paste";
import { Scan } from "~/assets/svg/Scan";
import { useMegaStore } from "~/state/megaStore";
import { MutinyInvoice } from "@mutinywallet/mutiny-wasm";
import { AmountEditable } from "~/components/AmountEditable";
import { StyledRadioGroup } from "~/components/layout/Radio";
import { ParsedParams, toParsedParams } from "./Scanner";
import { showToast } from "~/components/Toaster";
import eify from "~/utils/eify";
import { FullscreenModal } from "~/components/layout/FullscreenModal";
import handshake from "~/assets/hands/handshake.png";
import thumbsdown from "~/assets/hands/thumbsdown.png";
import mempoolTxUrl from "~/utils/mempoolTxUrl";
import { BackLink } from "~/components/layout/BackLink";

type SendSource = "lightning" | "onchain";

const PAYMENT_METHODS = [{ value: "lightning", label: "Lightning", caption: "Fast and cool" }, { value: "onchain", label: "On-chain", caption: "Just like Satoshi did it" }]

// const TEST_DEST = "bitcoin:tb1pdh43en28jmhnsrhxkusja46aufdlae5qnfrhucw5jvefw9flce3sdxfcwe?amount=0.00001&label=heyo&lightning=lntbs10u1pjrwrdedq8dpjhjmcnp4qd60w268ve0jencwzhz048ruprkxefhj0va2uspgj4q42azdg89uupp5gngy2pqte5q5uvnwcxwl2t8fsdlla5s6xl8aar4xcsvxeus2w2pqsp5n5jp3pz3vpu92p3uswttxmw79a5lc566herwh3f2amwz2sp6f9tq9qyysgqcqpcxqrpwugv5m534ww5ukcf6sdw2m75f2ntjfh3gzeqay649256yvtecgnhjyugf74zakaf56sdh66ec9fqep2kvu6xv09gcwkv36rrkm38ylqsgpw3yfjl"
// const TEST_DEST_ADDRESS = "tb1pdh43en28jmhnsrhxkusja46aufdlae5qnfrhucw5jvefw9flce3sdxfcwe"

// TODO: better success / fail type
type SentDetails = { amount?: bigint, destination?: string, txid?: string, failure_reason?: string }

export default function Send() {
    const [state, actions] = useMegaStore();

    // These can only be set by the user
    const [fieldDestination, setFieldDestination] = createSignal("");
    const [destination, setDestination] = createSignal<ParsedParams>();
    const [privateLabel, setPrivateLabel] = createSignal("");

    // These can be derived from the "destination" signal or set by the user
    const [amountSats, setAmountSats] = createSignal(0n);
    const [source, setSource] = createSignal<SendSource>("lightning");

    // These can only be derived from the "destination" signal
    const [invoice, setInvoice] = createSignal<MutinyInvoice>();
    const [nodePubkey, setNodePubkey] = createSignal<string>();
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
        setNodePubkey(undefined);
        setFieldDestination("");
    }

    const fakeFee = createMemo(() => {
        if (source() === "lightning") return 69n;
        if (source() === "onchain") return 420n;
        return 0n;
    })

    onMount(() => {
        if (state.scan_result) {
            setDestination(state.scan_result);
            actions.setScanResult(undefined);
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
            } else if (source.node_pubkey) {
                setAmountSats(source.amount_sats || 0n);
                setNodePubkey(source.node_pubkey);
                setSource("lightning")
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

    function parsePaste(text: string) {
        if (text) {
            const network = state.node_manager?.get_network() || "signet";
            const result = toParsedParams(text || "", network);
            if (!result.ok) {
                showToast(result.error);
                return;
            } else {
                if (result.value?.address || result.value?.invoice || result.value?.node_pubkey) {
                    setDestination(result.value);
                    // Important! we need to clear the scan result once we've used it
                    actions.setScanResult(undefined);
                }
            }
        }
    }

    function handleDecode() {
        const text = fieldDestination();
        parsePaste(text);
    }

    function handlePaste() {
        if (!navigator.clipboard.readText) return showToast(new Error("Clipboard not supported"));

        navigator.clipboard.readText().then(text => {
            setFieldDestination(text);
            parsePaste(text);
        }).catch((e) => {
            showToast(new Error("Failed to read clipboard: " + e.message))
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
            } else if (source() === "lightning" && nodePubkey()) {
                const nodes = await state.node_manager?.list_nodes();
                const firstNode = nodes[0] as string || ""
                const payment = await state.node_manager?.keysend(firstNode, nodePubkey()!, amountSats());
                console.log(payment?.value)

                // TODO: handle timeouts
                if (!payment?.paid) {
                    throw new Error("Keysend failed")
                } else {
                    sentDetails.amount = amountSats();
                }
            } else if (source() === "onchain" && address()) {
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
            const error = eify(e)
            setSentDetails({ failure_reason: error.message });
            // TODO: figure out ux of when we want to show toast vs error screen
            // showToast(eify(e))
            console.error(e);
        } finally {
            setSending(false);
        }
    }

    const sendButtonDisabled = createMemo(() => {
        return !destination() || sending() || amountSats() === 0n;
    })

    return (
        <NodeManagerGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink />
                    <LargeHeader>Send Bitcoin</LargeHeader>
                    <FullscreenModal
                        title={sentDetails()?.amount ? "Sent" : "Payment Failed"}
                        confirmText={sentDetails()?.amount ? "Nice" : "Too Bad"}
                        open={!!sentDetails()}
                        setOpen={(open: boolean) => { if (!open) setSentDetails(undefined) }}
                        onConfirm={() => setSentDetails(undefined)}
                    >
                        <div class="flex flex-col items-center gap-8 h-full">
                            <Switch>
                                <Match when={sentDetails()?.failure_reason}>
                                    <img src={thumbsdown} alt="thumbs down" class="w-1/2 mx-auto max-w-[50vh]" />
                                    <p class="text-xl font-light py-2 px-4 rounded-xl bg-white/10">{sentDetails()?.failure_reason}</p>
                                </Match>
                                <Match when={true}>
                                    <img src={handshake} alt="handshake" class="w-1/2 mx-auto max-w-[50vh]" />
                                    <Amount amountSats={sentDetails()?.amount} showFiat />
                                    <Show when={sentDetails()?.txid}>
                                        <a href={mempoolTxUrl(sentDetails()?.txid, state.node_manager?.get_network())} target="_blank" rel="noreferrer">
                                            Mempool Link
                                        </a>
                                    </Show>
                                </Match>
                            </Switch>
                        </div>
                    </FullscreenModal>
                    <dl>
                        <dt>
                            <SmallHeader>Destination</SmallHeader>
                        </dt>
                        <dd>
                            <Switch>
                                <Match when={address() || invoice() || nodePubkey()}>
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
                                        <Show when={nodePubkey() && source() === "lightning"}>
                                            <code class="truncate text-sm break-all">{"Node Pubkey: "} {nodePubkey()}

                                            </code>
                                        </Show>
                                        <Button class="flex-0" intent="glowy" layout="xs" onClick={clearAll}>Clear</Button>
                                    </div>
                                    <div class="my-8 flex flex-col sm:flex-row sm:justify-center gap-4 w-full items-center justify-center">
                                        {/* if the amount came with the invoice we can't allow setting it */}
                                        <Show when={!(invoice()?.amount_sats)} fallback={<Amount amountSats={amountSats() || 0} showFiat />}>
                                            <AmountEditable initialAmountSats={amountSats().toString() || "0"} setAmountSats={setAmountSats} />
                                        </Show>
                                        <div class="bg-white/10 px-4 py-2 rounded-xl">
                                            <div class="flex gap-2 items-center">
                                                <h2 class="text-neutral-400 font-semibold uppercase">+ Fee</h2>
                                                <h3 class="text-xl font-light text-neutral-300">
                                                    {fakeFee().toLocaleString()}&nbsp;<span class='text-lg'>SATS</span>
                                                </h3>
                                            </div>
                                            <div class="flex gap-2 items-center">
                                                <h2 class="font-semibold uppercase text-white">Total</h2>
                                                <h3 class="text-xl font-light text-white">
                                                    {(amountSats().valueOf() + fakeFee().valueOf()).toLocaleString()}&nbsp;<span class='text-lg'>SATS</span>
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                </Match>
                                <Match when={true}>
                                    <VStack>
                                        <textarea value={fieldDestination()} onInput={(e) => setFieldDestination(e.currentTarget.value)} placeholder="bitcoin:..." class="p-2 rounded-lg bg-white/10 placeholder-neutral-400" />
                                        <Button disabled={!fieldDestination()} intent="blue" onClick={handleDecode}>Decode</Button>
                                        <HStack>
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
                                        </HStack>
                                    </VStack>
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
                    </dl>
                    <Show when={destination()}>
                        <Button disabled={sendButtonDisabled()} intent="blue" onClick={handleSend} loading={sending()}>{sending() ? "Sending..." : "Confirm Send"}</Button>
                    </Show>
                </DefaultMain>
                <NavBar activeTab="send" />
            </SafeArea >
        </NodeManagerGuard >
    )
}