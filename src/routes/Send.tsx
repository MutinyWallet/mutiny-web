import { Match, Show, Switch, createEffect, createMemo, createSignal, onMount } from "solid-js";
import { Amount } from "~/components/Amount";
import NavBar from "~/components/NavBar";
import { Button, ButtonLink, Card, DefaultMain, HStack, LargeHeader, MutinyWalletGuard, SafeArea, SmallHeader, VStack } from "~/components/layout";
import { Paste } from "~/assets/svg/Paste";
import { Scan } from "~/assets/svg/Scan";
import { useMegaStore } from "~/state/megaStore";
import { Contact, MutinyInvoice } from "@mutinywallet/mutiny-wasm";
import { StyledRadioGroup } from "~/components/layout/Radio";
import { ParsedParams, toParsedParams } from "./Scanner";
import { showToast } from "~/components/Toaster";
import eify from "~/utils/eify";
import { FullscreenModal } from "~/components/layout/FullscreenModal";
import megacheck from "~/assets/icons/megacheck.png"
import megaex from "~/assets/icons/megaex.png";
import mempoolTxUrl from "~/utils/mempoolTxUrl";
import { BackLink } from "~/components/layout/BackLink";
import { useNavigate } from "solid-start";
import { TagEditor } from "~/components/TagEditor";
import { StringShower } from "~/components/ShareCard";
import { AmountCard } from "~/components/AmountCard";
import { MutinyTagItem, UNKNOWN_TAG, sortByLastUsed, tagsToIds } from "~/utils/tags";
import { BackButton } from "~/components/layout/BackButton";

type SendSource = "lightning" | "onchain";

// const TEST_DEST = "bitcoin:tb1pdh43en28jmhnsrhxkusja46aufdlae5qnfrhucw5jvefw9flce3sdxfcwe?amount=0.00001&label=heyo&lightning=lntbs10u1pjrwrdedq8dpjhjmcnp4qd60w268ve0jencwzhz048ruprkxefhj0va2uspgj4q42azdg89uupp5gngy2pqte5q5uvnwcxwl2t8fsdlla5s6xl8aar4xcsvxeus2w2pqsp5n5jp3pz3vpu92p3uswttxmw79a5lc566herwh3f2amwz2sp6f9tq9qyysgqcqpcxqrpwugv5m534ww5ukcf6sdw2m75f2ntjfh3gzeqay649256yvtecgnhjyugf74zakaf56sdh66ec9fqep2kvu6xv09gcwkv36rrkm38ylqsgpw3yfjl"
// const TEST_DEST_ADDRESS = "tb1pdh43en28jmhnsrhxkusja46aufdlae5qnfrhucw5jvefw9flce3sdxfcwe"

// TODO: better success / fail type
type SentDetails = { amount?: bigint, destination?: string, txid?: string, failure_reason?: string }

function MethodChooser(props: { source: SendSource, setSource: (source: string) => void }) {
    const [store, _actions] = useMegaStore();

    const methods = createMemo(() => {
        return [
            { value: "lightning", label: "Lightning", caption: store.balance?.lightning ? `${store.balance?.lightning.toLocaleString()} SATS` : "No balance" },
            { value: "onchain", label: "On-chain", caption: store.balance?.confirmed ? `${store.balance?.confirmed.toLocaleString()} SATS` : "No balance" }
        ]

    })
    return (
        <StyledRadioGroup accent="white" value={props.source} onValueChange={props.setSource} choices={methods()} />
    )
}

function DestinationInput(props: {
    fieldDestination: string,
    setFieldDestination: (destination: string) => void,
    handleDecode: () => void,
    handlePaste: () => void,
}) {
    return (
        <VStack>
            <SmallHeader>Destination</SmallHeader>
            <textarea value={props.fieldDestination} onInput={(e) => props.setFieldDestination(e.currentTarget.value)} placeholder="bitcoin:..." class="p-2 rounded-lg bg-white/10 placeholder-neutral-400" />
            <Button disabled={!props.fieldDestination} intent="blue" onClick={props.handleDecode}>Decode</Button>
            <HStack>
                <Button onClick={props.handlePaste}>
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
    )
}

function DestinationShower(props: {
    source: SendSource,
    description?: string,
    address?: string,
    invoice?: MutinyInvoice,
    nodePubkey?: string,
    clearAll: () => void,
}) {
    return (
        <Switch>
            <Match when={props.address && props.source === "onchain"}>
                <StringShower text={props.address || ""} />
            </Match>
            <Match when={props.invoice && props.source === "lightning"}>
                <StringShower text={props.invoice?.bolt11 || ""} />
            </Match>
            <Match when={props.nodePubkey && props.source === "lightning"}>
                <StringShower text={props.nodePubkey || ""} />
            </Match>
        </Switch>

    )
}

export default function Send() {
    const [state, actions] = useMegaStore();
    const navigate = useNavigate()

    // These can only be set by the user
    const [fieldDestination, setFieldDestination] = createSignal("");
    const [destination, setDestination] = createSignal<ParsedParams>();

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

    // Tagging stuff
    const [selectedContacts, setSelectedContacts] = createSignal<Partial<MutinyTagItem>[]>([]);

    function clearAll() {
        setDestination(undefined);
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
                state.mutiny_wallet?.decode_invoice(source.invoice).then(invoice => {
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
            const network = state.mutiny_wallet?.get_network() || "signet";
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

    async function handleSend() {
        try {
            setSending(true);
            const bolt11 = invoice()?.bolt11;
            const sentDetails: Partial<SentDetails> = {};

            const tags = await processContacts(selectedContacts());

            if (source() === "lightning" && invoice() && bolt11) {
                const nodes = await state.mutiny_wallet?.list_nodes();
                const firstNode = nodes[0] as string || ""
                sentDetails.destination = bolt11;
                // If the invoice has sats use that, otherwise we pass the user-defined amount
                if (invoice()?.amount_sats) {
                    await state.mutiny_wallet?.pay_invoice(firstNode, bolt11, undefined, tags);
                    sentDetails.amount = invoice()?.amount_sats;
                } else {
                    await state.mutiny_wallet?.pay_invoice(firstNode, bolt11, amountSats(), tags);
                    sentDetails.amount = amountSats();
                }
            } else if (source() === "lightning" && nodePubkey()) {
                const nodes = await state.mutiny_wallet?.list_nodes();
                const firstNode = nodes[0] as string || ""
                const payment = await state.mutiny_wallet?.keysend(firstNode, nodePubkey()!, amountSats(), tags);

                // TODO: handle timeouts
                if (!payment?.paid) {
                    throw new Error("Keysend failed")
                } else {
                    sentDetails.amount = amountSats();
                }
            } else if (source() === "onchain" && address()) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const txid = await state.mutiny_wallet?.send_to_address(address()!, amountSats(), tags);
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
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <Show when={address() || invoice() || nodePubkey()} fallback={<BackLink />}>
                        <BackButton onClick={() => clearAll()} title="Start Over" />
                    </Show>
                    <LargeHeader>Send Bitcoin</LargeHeader>
                    <FullscreenModal
                        title={sentDetails()?.amount ? "Sent" : "Payment Failed"}
                        confirmText={sentDetails()?.amount ? "Nice" : "Too Bad"}
                        open={!!sentDetails()}
                        setOpen={(open: boolean) => { if (!open) setSentDetails(undefined) }}
                        onConfirm={() => { setSentDetails(undefined); navigate("/"); }}
                    >
                        <div class="flex flex-col items-center gap-8 h-full">
                            <Switch>
                                <Match when={sentDetails()?.failure_reason}>
                                    <img src={megaex} alt="fail" class="w-1/2 mx-auto max-w-[50vh]" />
                                    <p class="text-xl font-light py-2 px-4 rounded-xl bg-white/10">{sentDetails()?.failure_reason}</p>
                                </Match>
                                <Match when={true}>
                                    <img src={megacheck} alt="success" class="w-1/2 mx-auto max-w-[50vh]" />
                                    <Amount amountSats={sentDetails()?.amount} showFiat />
                                    <Show when={sentDetails()?.txid}>
                                        <a href={mempoolTxUrl(sentDetails()?.txid, state.mutiny_wallet?.get_network())} target="_blank" rel="noreferrer">
                                            Mempool Link
                                        </a>
                                    </Show>
                                </Match>
                            </Switch>
                        </div>
                    </FullscreenModal>
                    <VStack biggap>
                        <Switch>
                            <Match when={address() || invoice() || nodePubkey()}>
                                <Show when={address() && invoice()}>
                                    <MethodChooser source={source()} setSource={setSource} />
                                </Show>
                                <Card>
                                    <VStack>
                                        <DestinationShower source={source()} description={description()} invoice={invoice()} address={address()} nodePubkey={nodePubkey()} clearAll={clearAll} />
                                        <SmallHeader>Private tags</SmallHeader>
                                        <TagEditor selectedValues={selectedContacts()} setSelectedValues={setSelectedContacts} placeholder="Add the receiver for your records" />
                                    </VStack>
                                </Card>

                                <AmountCard amountSats={amountSats().toString()} setAmountSats={setAmountSats} fee={fakeFee().toString()} isAmountEditable={!(invoice()?.amount_sats)} />
                            </Match>
                            <Match when={true}>
                                <DestinationInput fieldDestination={fieldDestination()} setFieldDestination={setFieldDestination} handleDecode={handleDecode} handlePaste={handlePaste} />
                            </Match>
                        </Switch>
                        <Show when={destination()}>
                            <Button class="w-full flex-grow-0" disabled={sendButtonDisabled()} intent="blue" onClick={handleSend} loading={sending()}>{sending() ? "Sending..." : "Confirm Send"}</Button>
                        </Show>
                    </VStack>
                </DefaultMain>
                <NavBar activeTab="send" />
            </SafeArea >
        </MutinyWalletGuard >
    )
}