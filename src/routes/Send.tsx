import { Clipboard } from "@capacitor/clipboard";
import { Capacitor } from "@capacitor/core";
import { Contact, MutinyInvoice } from "@mutinywallet/mutiny-wasm";
import {
    createEffect,
    createMemo,
    createSignal,
    Match,
    onMount,
    Show,
    Switch
} from "solid-js";
import { useNavigate } from "solid-start";

import { Paste } from "~/assets/svg/Paste";
import { Scan } from "~/assets/svg/Scan";
import {
    ActivityDetailsModal,
    AmountCard,
    AmountFiat,
    AmountSats,
    BackButton,
    BackLink,
    Button,
    ButtonLink,
    Card,
    DefaultMain,
    Fee,
    GiftLink,
    HackActivityType,
    HStack,
    InfoBox,
    LargeHeader,
    MegaCheck,
    MegaEx,
    MutinyWalletGuard,
    NavBar,
    SafeArea,
    showToast,
    SmallHeader,
    StringShower,
    StyledRadioGroup,
    SuccessModal,
    TagEditor,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { ParsedParams } from "~/logic/waila";
import { useMegaStore } from "~/state/megaStore";
import { eify, MutinyTagItem, vibrateSuccess } from "~/utils";

export type SendSource = "lightning" | "onchain";

// const TEST_DEST = "bitcoin:tb1pdh43en28jmhnsrhxkusja46aufdlae5qnfrhucw5jvefw9flce3sdxfcwe?amount=0.00001&label=heyo&lightning=lntbs10u1pjrwrdedq8dpjhjmcnp4qd60w268ve0jencwzhz048ruprkxefhj0va2uspgj4q42azdg89uupp5gngy2pqte5q5uvnwcxwl2t8fsdlla5s6xl8aar4xcsvxeus2w2pqsp5n5jp3pz3vpu92p3uswttxmw79a5lc566herwh3f2amwz2sp6f9tq9qyysgqcqpcxqrpwugv5m534ww5ukcf6sdw2m75f2ntjfh3gzeqay649256yvtecgnhjyugf74zakaf56sdh66ec9fqep2kvu6xv09gcwkv36rrkm38ylqsgpw3yfjl"
// const TEST_DEST_ADDRESS = "tb1pdh43en28jmhnsrhxkusja46aufdlae5qnfrhucw5jvefw9flce3sdxfcwe"

// TODO: better success / fail type
type SentDetails = {
    amount?: bigint;
    destination?: string;
    txid?: string;
    payment_hash?: string;
    failure_reason?: string;
    fee_estimate?: bigint | number;
};

export function MethodChooser(props: {
    source: SendSource;
    setSource: (source: string) => void;
    both?: boolean;
}) {
    const [store, _actions] = useMegaStore();

    const methods = createMemo(() => {
        const lnBalance = store.balance?.lightning || 0n;
        const onchainBalance =
            (store.balance?.confirmed || 0n) +
            (store.balance?.unconfirmed || 0n);
        return [
            {
                value: "lightning",
                label: "Lightning Balance",
                caption:
                    lnBalance > 0n
                        ? `${lnBalance.toLocaleString()} SATS`
                        : "No balance",
                disabled: lnBalance === 0n
            },
            {
                value: "onchain",
                label: "On-chain Balance",
                caption:
                    onchainBalance > 0n
                        ? `${onchainBalance.toLocaleString()} SATS`
                        : "No balance",
                disabled: onchainBalance === 0n
            }
        ];
    });
    return (
        <Switch>
            <Match when={props.both}>
                <StyledRadioGroup
                    accent="white"
                    initialValue={props.source}
                    onValueChange={props.setSource}
                    choices={methods()}
                />
            </Match>
            <Match when={props.source === "lightning"}>
                <StyledRadioGroup
                    accent="white"
                    initialValue={props.source}
                    onValueChange={props.setSource}
                    choices={[methods()[0]]}
                />
            </Match>
            <Match when={props.source === "onchain"}>
                <StyledRadioGroup
                    accent="white"
                    initialValue={props.source}
                    onValueChange={props.setSource}
                    choices={[methods()[1]]}
                />
            </Match>
        </Switch>
    );
}

function DestinationInput(props: {
    fieldDestination: string;
    setFieldDestination: (destination: string) => void;
    handleDecode: () => void;
    handlePaste: () => void;
}) {
    const i18n = useI18n();
    return (
        <VStack>
            <SmallHeader>{i18n.t("send.destination")}</SmallHeader>
            <textarea
                value={props.fieldDestination}
                onInput={(e) => {
                    const trim = e.currentTarget.value.trim();
                    props.setFieldDestination(trim);
                }}
                placeholder="bitcoin:..."
                class="rounded-lg bg-white/10 p-2 placeholder-neutral-400"
            />
            <Button
                disabled={!props.fieldDestination}
                intent="blue"
                onClick={props.handleDecode}
            >
                {i18n.t("common.continue")}
            </Button>
            <HStack>
                <Button onClick={props.handlePaste}>
                    <div class="flex flex-col items-center gap-2">
                        <Paste />
                        <span>{i18n.t("send.paste")}</span>
                    </div>
                </Button>
                <ButtonLink href="/scanner">
                    <div class="flex flex-col items-center gap-2">
                        <Scan />
                        <span>{i18n.t("send.scan_qr")}</span>
                    </div>
                </ButtonLink>
            </HStack>
        </VStack>
    );
}

function DestinationShower(props: {
    source: SendSource;
    description?: string;
    address?: string;
    invoice?: MutinyInvoice;
    nodePubkey?: string;
    lnurl?: string;
    clearAll: () => void;
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
            <Match when={props.lnurl && props.source === "lightning"}>
                <StringShower text={props.lnurl || ""} />
            </Match>
        </Switch>
    );
}

export default function Send() {
    const [state, actions] = useMegaStore();
    const navigate = useNavigate();
    const i18n = useI18n();

    // These can only be set by the user
    const [fieldDestination, setFieldDestination] = createSignal("");
    const [destination, setDestination] = createSignal<ParsedParams>();

    // These can be derived from the "destination" signal or set by the user
    const [amountSats, setAmountSats] = createSignal(0n);
    const [isAmtEditable, setIsAmtEditable] = createSignal(true);
    const [source, setSource] = createSignal<SendSource>("lightning");

    // These can only be derived from the "destination" signal
    const [invoice, setInvoice] = createSignal<MutinyInvoice>();
    const [nodePubkey, setNodePubkey] = createSignal<string>();
    const [lnurlp, setLnurlp] = createSignal<string>();
    const [address, setAddress] = createSignal<string>();
    const [description, setDescription] = createSignal<string>();

    // Is sending / sent
    const [sending, setSending] = createSignal(false);
    const [sentDetails, setSentDetails] = createSignal<SentDetails>();

    // Tagging stuff
    const [selectedContacts, setSelectedContacts] = createSignal<
        Partial<MutinyTagItem>[]
    >([]);

    // Details Modal
    const [detailsOpen, setDetailsOpen] = createSignal(false);
    const [detailsKind, setDetailsKind] = createSignal<HackActivityType>();
    const [detailsId, setDetailsId] = createSignal("");

    // Errors
    const [error, setError] = createSignal<string>();

    function clearAll() {
        setDestination(undefined);
        setAmountSats(0n);
        setIsAmtEditable(true);
        setSource("lightning");
        setInvoice(undefined);
        setAddress(undefined);
        setDescription(undefined);
        setNodePubkey(undefined);
        setLnurlp(undefined);
        setFieldDestination("");
    }

    function openDetailsModal() {
        const paymentTxId = sentDetails()?.txid
            ? sentDetails()
                ? sentDetails()?.txid
                : undefined
            : sentDetails()
            ? sentDetails()?.payment_hash
            : undefined;
        const kind = sentDetails()?.txid ? "OnChain" : "Lightning";

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

    // If we got here from a scan result we want to set the destination and clean up that scan result
    onMount(() => {
        if (state.scan_result) {
            setDestination(state.scan_result);
            actions.setScanResult(undefined);
        }
    });

    // Three suspiciously similar "max" values we want to compute
    const maxOnchain = createMemo(() => {
        return (
            (state.balance?.confirmed ?? 0n) +
            (state.balance?.unconfirmed ?? 0n)
        );
    });

    const maxAmountSats = createMemo(() => {
        return source() === "onchain" ? maxOnchain() : undefined;
    });

    const isMax = createMemo(() => {
        if (source() === "onchain") {
            return amountSats() === maxOnchain();
        }
    });

    // Rerun every time the source or amount changes to check for amount errors
    createEffect(() => {
        setError(undefined);
        // Don't recompute if sending
        if (sending()) return;
        if (source() === "onchain" && maxOnchain() < amountSats()) {
            setError(i18n.t("send.error_low_balance"));
            return;
        }
        if (
            source() === "lightning" &&
            (state.balance?.lightning ?? 0n) <= amountSats()
        ) {
            setError(i18n.t("send.error_low_balance"));
            return;
        }
        if (
            source() === "lightning" &&
            !!invoice()?.amount_sats &&
            amountSats() !== invoice()?.amount_sats
        ) {
            setError(
                i18n.t("send.error_invoice_match", {
                    amount: invoice()?.amount_sats?.toLocaleString()
                })
            );
            return;
        }
    });

    // Rerun every time the amount changes if we're onchain
    const feeEstimate = createMemo(() => {
        if (
            source() === "onchain" &&
            amountSats() &&
            amountSats() > 0n &&
            address()
        ) {
            try {
                // If max we want to use the sweep fee estimator
                if (isMax()) {
                    return state.mutiny_wallet?.estimate_sweep_tx_fee(
                        address()!
                    );
                }

                return state.mutiny_wallet?.estimate_tx_fee(
                    address()!,
                    amountSats(),
                    undefined
                );
            } catch (e) {
                setError(eify(e).message);
            }
        }
        return undefined;
    });

    // Rerun every time the destination changes
    createEffect(() => {
        const source = destination();
        if (!source) return;
        try {
            if (source.address) setAddress(source.address);
            if (source.memo) setDescription(source.memo);

            if (source.invoice) {
                state.mutiny_wallet
                    ?.decode_invoice(source.invoice)
                    .then((invoice) => {
                        if (invoice?.amount_sats) {
                            setAmountSats(invoice.amount_sats);
                            setIsAmtEditable(false);
                        }
                        setInvoice(invoice);
                        setSource("lightning");
                    });
            } else if (source.node_pubkey) {
                setAmountSats(source.amount_sats || 0n);
                setNodePubkey(source.node_pubkey);
                setSource("lightning");
            } else if (source.lnurl) {
                state.mutiny_wallet
                    ?.decode_lnurl(source.lnurl)
                    .then((lnurlParams) => {
                        if (lnurlParams.tag === "payRequest") {
                            if (lnurlParams.min == lnurlParams.max) {
                                setAmountSats(lnurlParams.min / 1000n);
                                setIsAmtEditable(false);
                            } else {
                                setAmountSats(source.amount_sats || 0n);
                            }
                            setLnurlp(source.lnurl);
                            setSource("lightning");
                        }
                    })
                    .catch((e) => {
                        showToast(eify(e));
                    });
            } else {
                setAmountSats(source.amount_sats || 0n);
                setSource("onchain");
            }
            // Return the source just to trigger `decodedDestination` as not undefined
            return source;
        } catch (e) {
            console.error("error", e);
            clearAll();
        }
    });

    function parsePaste(text: string) {
        actions.handleIncomingString(
            text,
            (error) => {
                showToast(error);
            },
            (result) => {
                setDestination(result);
                // Important! we need to clear the scan result once we've used it
                actions.setScanResult(undefined);
            }
        );
    }

    function handleDecode() {
        const text = fieldDestination();
        parsePaste(text);
    }

    async function handlePaste() {
        try {
            let text;

            if (Capacitor.isNativePlatform()) {
                const { value } = await Clipboard.read();
                text = value;
            } else {
                if (!navigator.clipboard.readText) {
                    return showToast(new Error(i18n.t("send.error_clipboard")));
                }
                text = await navigator.clipboard.readText();
            }

            const trimText = text.trim();
            setFieldDestination(trimText);
            parsePaste(trimText);
        } catch (e) {
            console.error(e);
        }
    }

    async function processContacts(
        contacts: Partial<MutinyTagItem>[]
    ): Promise<string[]> {
        if (contacts.length) {
            const first = contacts![0];

            if (!first.name) {
                return [];
            }

            if (!first.id && first.name) {
                const c = new Contact(
                    first.name,
                    undefined,
                    undefined,
                    undefined
                );
                try {
                    const newContactId =
                        await state.mutiny_wallet?.create_new_contact(c);
                    if (newContactId) {
                        return [newContactId];
                    }
                } catch (e) {
                    console.error(e);
                }
            }

            if (first.id) {
                return [first.id];
            }
        }

        return [];
    }

    async function handleSend() {
        try {
            setSending(true);
            const bolt11 = invoice()?.bolt11;
            const sentDetails: Partial<SentDetails> = {};

            const tags = await processContacts(selectedContacts());

            if (source() === "lightning" && invoice() && bolt11) {
                const nodes = await state.mutiny_wallet?.list_nodes();
                const firstNode = (nodes[0] as string) || "";
                sentDetails.destination = bolt11;
                // If the invoice has sats use that, otherwise we pass the user-defined amount
                if (invoice()?.amount_sats) {
                    const payment = await state.mutiny_wallet?.pay_invoice(
                        firstNode,
                        bolt11,
                        undefined,
                        tags
                    );
                    sentDetails.amount = invoice()?.amount_sats;
                    sentDetails.payment_hash = invoice()?.payment_hash;
                    sentDetails.fee_estimate = payment?.fees_paid || 0;
                } else {
                    const payment = await state.mutiny_wallet?.pay_invoice(
                        firstNode,
                        bolt11,
                        amountSats(),
                        tags
                    );
                    sentDetails.amount = amountSats();
                    sentDetails.payment_hash = invoice()?.payment_hash;
                    sentDetails.fee_estimate = payment?.fees_paid || 0;
                }
            } else if (source() === "lightning" && nodePubkey()) {
                const nodes = await state.mutiny_wallet?.list_nodes();
                const firstNode = (nodes[0] as string) || "";
                const payment = await state.mutiny_wallet?.keysend(
                    firstNode,
                    nodePubkey()!,
                    amountSats(),
                    undefined, // todo add optional keysend message
                    tags
                );

                // TODO: handle timeouts
                if (!payment?.paid) {
                    throw new Error(i18n.t("send.error_keysend"));
                } else {
                    sentDetails.amount = amountSats();
                    sentDetails.payment_hash = invoice()?.payment_hash;
                    sentDetails.fee_estimate = payment?.fees_paid || 0;
                }
            } else if (source() === "lightning" && lnurlp()) {
                const nodes = await state.mutiny_wallet?.list_nodes();
                const firstNode = (nodes[0] as string) || "";
                const payment = await state.mutiny_wallet?.lnurl_pay(
                    firstNode,
                    lnurlp()!,
                    amountSats(),
                    undefined, // zap_npub
                    tags
                );
                sentDetails.payment_hash = invoice()?.payment_hash;

                if (!payment?.paid) {
                    throw new Error(i18n.t("send.error_LNURL"));
                } else {
                    sentDetails.amount = amountSats();
                    sentDetails.payment_hash = invoice()?.payment_hash;
                    sentDetails.fee_estimate = payment?.fees_paid || 0;
                }
            } else if (source() === "onchain" && address()) {
                if (isMax()) {
                    // If we're trying to send the max amount, use the sweep method instead of regular send
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const txid = await state.mutiny_wallet?.sweep_wallet(
                        address()!,
                        tags
                    );

                    sentDetails.amount = amountSats();
                    sentDetails.destination = address();
                    sentDetails.txid = txid;
                    sentDetails.fee_estimate = feeEstimate() ?? 0;
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const txid = await state.mutiny_wallet?.send_to_address(
                        address()!,
                        amountSats(),
                        tags
                    );
                    sentDetails.amount = amountSats();
                    sentDetails.destination = address();
                    sentDetails.txid = txid;
                    sentDetails.fee_estimate = feeEstimate() ?? 0;
                }
            }
            setSentDetails(sentDetails as SentDetails);
            clearAll();
            await vibrateSuccess();
        } catch (e) {
            const error = eify(e);
            setSentDetails({ failure_reason: error.message });
            // TODO: figure out ux of when we want to show toast vs error screen
            // showToast(eify(e))
            console.error(e);
        } finally {
            setSending(false);
        }
    }

    const sendButtonDisabled = createMemo(() => {
        return !destination() || sending() || amountSats() === 0n || !!error();
    });

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <Show
                        when={
                            address() || invoice() || nodePubkey() || lnurlp()
                        }
                        fallback={<BackLink />}
                    >
                        <BackButton
                            onClick={() => clearAll()}
                            title={i18n.t("send.start_over")}
                        />
                    </Show>
                    <LargeHeader>{i18n.t("send.send_bitcoin")}</LargeHeader>
                    <SuccessModal
                        confirmText={
                            sentDetails()?.amount
                                ? i18n.t("common.nice")
                                : i18n.t("common.home")
                        }
                        open={!!sentDetails()}
                        setOpen={(open: boolean) => {
                            if (!open) setSentDetails(undefined);
                        }}
                        onConfirm={() => {
                            setSentDetails(undefined);
                            navigate("/");
                        }}
                    >
                        <Switch>
                            <Match when={sentDetails()?.failure_reason}>
                                <MegaEx />
                                <h1 class="mb-2 mt-4 w-full text-center text-2xl font-semibold md:text-3xl">
                                    {sentDetails()?.amount
                                        ? source() === "onchain"
                                            ? i18n.t("send.payment_initiated")
                                            : i18n.t("send.payment_sent")
                                        : sentDetails()?.failure_reason}
                                </h1>
                                {/*TODO: add failure hint logic for different failure conditions*/}
                            </Match>
                            <Match when={true}>
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
                                    {sentDetails()?.amount
                                        ? source() === "onchain"
                                            ? i18n.t("send.payment_initiated")
                                            : i18n.t("send.payment_sent")
                                        : sentDetails()?.failure_reason}
                                </h1>
                                <div class="flex flex-col items-center gap-1">
                                    <div class="text-xl">
                                        <AmountSats
                                            amountSats={sentDetails()?.amount}
                                            icon="minus"
                                        />
                                    </div>
                                    <div class="text-white/70">
                                        <AmountFiat
                                            amountSats={sentDetails()?.amount}
                                            denominationSize="sm"
                                        />
                                    </div>
                                </div>
                                <hr class="w-16 bg-m-grey-400" />
                                <Fee amountSats={sentDetails()?.fee_estimate} />
                                <p
                                    class="cursor-pointer underline"
                                    onClick={openDetailsModal}
                                >
                                    {i18n.t("common.view_payment_details")}
                                </p>
                            </Match>
                        </Switch>
                    </SuccessModal>
                    <VStack biggap>
                        <Switch>
                            <Match
                                when={
                                    address() ||
                                    invoice() ||
                                    nodePubkey() ||
                                    lnurlp()
                                }
                            >
                                <MethodChooser
                                    source={source()}
                                    setSource={setSource}
                                    both={!!address() && !!invoice()}
                                />
                                <Card title={i18n.t("send.destination")}>
                                    <VStack>
                                        <DestinationShower
                                            source={source()}
                                            description={description()}
                                            invoice={invoice()}
                                            address={address()}
                                            nodePubkey={nodePubkey()}
                                            lnurl={lnurlp()}
                                            clearAll={clearAll}
                                        />
                                        <SmallHeader>
                                            {i18n.t("common.private_tags")}
                                        </SmallHeader>
                                        <TagEditor
                                            autoFillTag={
                                                destination()?.privateTag
                                            }
                                            selectedValues={selectedContacts()}
                                            setSelectedValues={
                                                setSelectedContacts
                                            }
                                            placeholder={i18n.t(
                                                "send.contact_placeholder"
                                            )}
                                        />
                                    </VStack>
                                </Card>
                                <AmountCard
                                    amountSats={amountSats().toString()}
                                    setAmountSats={setAmountSats}
                                    fee={feeEstimate()?.toString()}
                                    isAmountEditable={isAmtEditable()}
                                    maxAmountSats={maxAmountSats()}
                                />
                                <Show when={error()}>
                                    <InfoBox accent="red">
                                        <p>{error()}</p>
                                    </InfoBox>
                                </Show>
                            </Match>
                            <Match when={true}>
                                <DestinationInput
                                    fieldDestination={fieldDestination()}
                                    setFieldDestination={setFieldDestination}
                                    handleDecode={handleDecode}
                                    handlePaste={handlePaste}
                                />
                            </Match>
                        </Switch>
                        <Show
                            when={
                                address() ||
                                invoice() ||
                                nodePubkey() ||
                                lnurlp()
                            }
                        >
                            <VStack>
                                <Button
                                    disabled={sendButtonDisabled()}
                                    intent="blue"
                                    onClick={handleSend}
                                    loading={sending()}
                                >
                                    {sending()
                                        ? i18n.t("send.sending")
                                        : i18n.t("send.confirm_send")}
                                </Button>
                            </VStack>
                        </Show>
                        <div class="flex justify-center">
                            <GiftLink />
                        </div>
                    </VStack>
                </DefaultMain>
                <NavBar activeTab="send" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
