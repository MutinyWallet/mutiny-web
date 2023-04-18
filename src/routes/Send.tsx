import { TextField } from "@kobalte/core";
import { Show, createMemo, createResource, createSignal, onMount } from "solid-js";
import { Amount } from "~/components/Amount";
import NavBar from "~/components/NavBar";
import { Button, ButtonLink, DefaultMain, LargeHeader, SafeArea, SmallHeader } from "~/components/layout";
import { Paste } from "~/assets/svg/Paste";
import { Scan } from "~/assets/svg/Scan";
import { useMegaStore } from "~/state/megaStore";
import { MutinyInvoice, NodeManager } from "@mutinywallet/mutiny-wasm";
import { bip21decode } from "~/utils/TEMPbip21";
import { AmountEditable } from "~/components/AmountEditable";
import { useLocation } from "solid-start";
import { StyledRadioGroup } from "~/components/layout/Radio";
import { SentModal } from "~/components/Sent";

type SendSource = "lightning" | "onchain";

const PAYMENT_METHODS = [{ value: "lightning", label: "Lightning", caption: "Fast and cool" }, { value: "onchain", label: "On-chain", caption: "Just like Satoshi did it" }]

// const TEST_DEST = "bitcoin:tb1pdh43en28jmhnsrhxkusja46aufdlae5qnfrhucw5jvefw9flce3sdxfcwe?amount=0.00001&label=heyo&lightning=lntbs10u1pjrwrdedq8dpjhjmcnp4qd60w268ve0jencwzhz048ruprkxefhj0va2uspgj4q42azdg89uupp5gngy2pqte5q5uvnwcxwl2t8fsdlla5s6xl8aar4xcsvxeus2w2pqsp5n5jp3pz3vpu92p3uswttxmw79a5lc566herwh3f2amwz2sp6f9tq9qyysgqcqpcxqrpwugv5m534ww5ukcf6sdw2m75f2ntjfh3gzeqay649256yvtecgnhjyugf74zakaf56sdh66ec9fqep2kvu6xv09gcwkv36rrkm38ylqsgpw3yfjl"
// const TEST_DEST_ADDRESS = "tb1pdh43en28jmhnsrhxkusja46aufdlae5qnfrhucw5jvefw9flce3sdxfcwe"

type SentDetails = { nice: string }

export default function Send() {
    const [state, _] = useMegaStore();


    // These can only be set by the user
    const [destination, setDestination] = createSignal("");
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
        setDestination("");
        setPrivateLabel("");
        setAmountSats(0n);
        setSource("lightning");
        setInvoice(undefined);
        setAddress(undefined);
        setDescription(undefined);
    }

    // If we were routed to by the scanner we can get the state from there
    const location = useLocation();

    const fakeFee = createMemo(() => {
        if (source() === "lightning") return 69n;
        if (source() === "onchain") return 420n;
        return 0n;
    })

    onMount(() => {
        // TODO: probably a cleaner way to make typescript happy
        const routerInfo = location as { state?: { destination?: string } };
        if (routerInfo.state?.destination && typeof routerInfo.state.destination === "string") {
            setDestination(routerInfo.state.destination);
        }
    })

    // TODO: this is pretty temp until we have WAILA
    async function decode(source: string) {
        if (!source) return;
        try {
            const { address, label, lightning, amount } = bip21decode(source);

            setAddress(address)

            if (lightning) {
                const invoice = await state.node_manager?.decode_invoice(lightning);
                if (invoice?.amount_sats) setAmountSats(invoice.amount_sats);
                setInvoice(invoice)
                // We can stick with default lightning because there's an invoice
                setSource("lightning")
            } else {
                // If we can't use the lightning amount we have to use the float btc amount
                const amt = NodeManager.convert_btc_to_sats(amount || 0);
                setAmountSats(amt);

                // We use onchain because there's no invoice
                setSource("onchain")
            }

            if (label) setDescription(label);

            setInvoice(invoice)

            return invoice

        } catch (e) {
            console.error("error", e)
            clearAll();
        }
    }

    // IMPORTANT: pass the signal but don't "call" the signal (`destination`, not `destination()`)
    const [decodedDestination] = createResource(destination, decode);

    let labelInput!: HTMLInputElement;

    function handlePaste() {
        navigator.clipboard.readText().then(text => {
            setDestination(text);
            labelInput.focus();
        });
    }

    async function handleSend() {
        try {
            setSending(true);
            const bolt11 = invoice()?.bolt11;
            if (source() === "lightning" && invoice() && bolt11) {
                const nodes = await state.node_manager?.list_nodes();
                const firstNode = nodes[0] as string || ""
                // If the invoice has sats use that, otherwise we pass the user-defined amount
                if (invoice()?.amount_sats) {
                    await state.node_manager?.pay_invoice(firstNode, bolt11);
                } else {
                    await state.node_manager?.pay_invoice(firstNode, bolt11, amountSats());
                }
            } else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const txid = await state.node_manager?.send_to_address(address()!, amountSats());
                console.error(txid)
            }

            setSentDetails({ nice: "nice" });
            clearAll();
            console.error("SENT");
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    }

    return (
        <SafeArea>
            <DefaultMain>
                <LargeHeader>Send Bitcoin</LargeHeader>
                <SentModal details={sentDetails()} />
                <dl>
                    <dt>
                        <SmallHeader>Destination</SmallHeader>
                    </dt>
                    <dd>
                        <Show when={decodedDestination()} fallback={<div class="flex flex-row gap-4">
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
                        </div>}>
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
                        </Show>
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
                                    ref={el => labelInput = el}
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
    )
}