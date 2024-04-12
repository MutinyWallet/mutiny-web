import { MutinyInvoice, TagItem } from "@mutinywallet/mutiny-wasm";
import { useLocation, useNavigate, useSearchParams } from "@solidjs/router";
import { Eye, EyeOff, Link, X, Zap } from "lucide-solid";
import {
    createEffect,
    createMemo,
    createResource,
    createSignal,
    JSX,
    Match,
    onMount,
    Show,
    Suspense,
    Switch
} from "solid-js";

import {
    ActivityDetailsModal,
    AmountEditable,
    AmountFiat,
    AmountSats,
    BackPop,
    Button,
    DefaultMain,
    Failure,
    Fee,
    FeeDisplay,
    HackActivityType,
    InfoBox,
    LabelCircle,
    LoadingShimmer,
    MegaCheck,
    MethodChoice,
    MutinyWalletGuard,
    NavBar,
    SharpButton,
    showToast,
    SimpleInput,
    SmallHeader,
    StringShower,
    SuccessModal,
    UnstyledBackPop,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { ParsedParams } from "~/logic/waila";
import { useMegaStore } from "~/state/megaStore";
import { eify, vibrateSuccess } from "~/utils";

export type SendSource = "lightning" | "onchain";
export type PrivacyLevel = "Public" | "Private" | "Anonymous" | "Not Available";

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

function DestinationShower(props: {
    source: SendSource;
    description?: string;
    address?: string;
    invoice?: MutinyInvoice;
    nodePubkey?: string;
    lnurl?: string;
    lightning_address?: string;
    contact?: TagItem;
}) {
    return (
        <Switch>
            <Match when={props.contact}>
                <DestinationItem
                    title={props.contact?.name || ""}
                    value={props.contact?.ln_address}
                    icon={
                        <LabelCircle
                            name={props.contact?.name || ""}
                            image_url={props.contact?.image_url}
                            contact
                            label={false}
                        />
                    }
                />
            </Match>
            <Match when={props.address && props.source === "onchain"}>
                <DestinationItem
                    title="On-chain"
                    value={<StringShower text={props.address || ""} />}
                    icon={<Link class="h-4 w-4" />}
                />
            </Match>
            <Match when={props.invoice && props.source === "lightning"}>
                <DestinationItem
                    title="Lightning"
                    value={<StringShower text={props.invoice?.bolt11 || ""} />}
                    icon={<Zap class="h-4 w-4" />}
                />
            </Match>
            <Match
                when={props.lightning_address && props.source === "lightning"}
            >
                <DestinationItem
                    title="Lightning"
                    value={props.lightning_address || ""}
                    icon={<Zap class="h-4 w-4" />}
                />
            </Match>
            <Match when={props.nodePubkey && props.source === "lightning"}>
                <DestinationItem
                    title="Lightning"
                    value={<StringShower text={props.nodePubkey || ""} />}
                    icon={<Zap class="h-4 w-4" />}
                />
            </Match>
            <Match
                when={
                    props.lnurl &&
                    !props.lightning_address &&
                    props.source === "lightning"
                }
            >
                <DestinationItem
                    title="Lightning"
                    value={<StringShower text={props.lnurl || ""} />}
                    icon={<Zap class="h-4 w-4" />}
                />
            </Match>
        </Switch>
    );
}

export function DestinationItem(props: {
    title: string;
    value: JSX.Element;
    icon: JSX.Element;
}) {
    return (
        <div class="grid grid-cols-[auto_minmax(0,_1fr)_minmax(0,_max-content)] items-center gap-2 rounded-xl bg-neutral-800 p-2">
            {props.icon}
            <div class="flex flex-col gap-1">
                <SmallHeader>{props.title}</SmallHeader>
                <div class="text-sm text-neutral-500">{props.value}</div>
            </div>
            <UnstyledBackPop default="/">
                <div class="h-8 w-8 rounded-full bg-m-grey-800 px-1 py-1">
                    <X class="h-6 w-6" />
                </div>
            </UnstyledBackPop>
        </div>
    );
}

export function Send() {
    const [state, actions] = useMegaStore();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const i18n = useI18n();

    const [amountInput, setAmountInput] = createSignal("");
    const [whatForInput, setWhatForInput] = createSignal("");

    // These can be derived from the destination or set by the user
    const [amountSats, setAmountSats] = createSignal(0n);
    const [unparsedAmount, setUnparsedAmount] = createSignal(true);

    // These are derived from the incoming destination
    const [isAmtEditable, setIsAmtEditable] = createSignal(true);
    const [source, setSource] = createSignal<SendSource>("lightning");
    const [invoice, setInvoice] = createSignal<MutinyInvoice>();
    const [nodePubkey, setNodePubkey] = createSignal<string>();
    const [lnurlp, setLnurlp] = createSignal<string>();
    const [lnAddress, setLnAddress] = createSignal<string>();
    const [originalScan, setOriginalScan] = createSignal<string>();
    const [address, setAddress] = createSignal<string>();
    const [payjoinEnabled, setPayjoinEnabled] = createSignal<boolean>();
    const [description, setDescription] = createSignal<string>();
    const [contactId, setContactId] = createSignal<string>();
    const [isHodlInvoice, setIsHodlInvoice] = createSignal<boolean>(false);

    // Is sending / sent
    const [sending, setSending] = createSignal(false);
    const [sentDetails, setSentDetails] = createSignal<SentDetails>();

    // Details Modal
    const [detailsOpen, setDetailsOpen] = createSignal(false);
    const [detailsKind, setDetailsKind] = createSignal<HackActivityType>();
    const [detailsId, setDetailsId] = createSignal("");

    // Errors
    const [error, setError] = createSignal<string>();

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

    // TODO: can I dedupe this from the search page?
    function parsePaste(text: string) {
        actions.handleIncomingString(
            text,
            (error) => {
                showToast(error);
            },
            (result) => {
                actions.setScanResult(result);
                navigate("/send", { state: { previous: "/search" } });
            }
        );
    }

    // send?invoice=... need to check for wallet because we can't parse until we have the wallet
    createEffect(() => {
        if (params.invoice && state.mutiny_wallet) {
            parsePaste(params.invoice);
            setParams({ invoice: undefined });
        }
    });

    const maxOnchain = createMemo(() => {
        return (
            (state.balance?.confirmed ?? 0n) +
            (state.balance?.unconfirmed ?? 0n)
        );
    });

    const maxLightning = createMemo(() => {
        const fed = state.balance?.federation ?? 0n;
        const ln = state.balance?.lightning ?? 0n;
        if (fed > ln) {
            return fed;
        } else {
            return ln;
        }
    });

    const maxAmountSats = createMemo(() => {
        return source() === "onchain" ? maxOnchain() : maxLightning();
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
            (state.balance?.lightning ?? 0n) <= amountSats() &&
            (state.balance?.federation ?? 0n) <= amountSats()
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

    const [parsingDestination, setParsingDestination] = createSignal(false);

    const [decodingLnUrl, setDecodingLnUrl] = createSignal(false);

    function handleDestination(source: ParsedParams | undefined) {
        if (!source) return;
        setParsingDestination(true);
        setOriginalScan(source.original);
        try {
            if (source.address) setAddress(source.address);
            if (source.payjoin_enabled)
                setPayjoinEnabled(source.payjoin_enabled);
            if (source.memo) setDescription(source.memo);
            if (source.contact_id) setContactId(source.contact_id);

            if (source.invoice) {
                processInvoice(source as ParsedParams & { invoice: string });
            } else if (source.node_pubkey) {
                processNodePubkey(
                    source as ParsedParams & { node_pubkey: string }
                );
            } else if (source.lnurl) {
                console.log("processing lnurl");
                processLnurl(source as ParsedParams & { lnurl: string });
            } else {
                setAmountSats(source.amount_sats || 0n);
                if (source.amount_sats) setIsAmtEditable(false);
                setSource("onchain");
            }
            // Return the source just to trigger `decodedDestination` as not undefined
            return source;
        } catch (e) {
            console.error("error", e);
        } finally {
            setParsingDestination(false);
        }
    }

    // A ParsedParams with an invoice in it
    function processInvoice(source: ParsedParams & { invoice: string }) {
        state.mutiny_wallet
            ?.decode_invoice(source.invoice!)
            .then((invoice) => {
                if (invoice.expire <= Date.now() / 1000) {
                    navigate("/search");
                    throw new Error(i18n.t("send.error_expired"));
                }

                if (invoice?.amount_sats) {
                    setAmountSats(invoice.amount_sats);
                    setIsAmtEditable(false);
                }
                setInvoice(invoice);
                setIsHodlInvoice(invoice.potential_hodl_invoice);
                setSource("lightning");
            })
            .catch((e) => showToast(eify(e)));
    }

    // A ParsedParams with a node_pubkey in it
    function processNodePubkey(source: ParsedParams & { node_pubkey: string }) {
        setAmountSats(source.amount_sats || 0n);
        setNodePubkey(source.node_pubkey);
        setSource("lightning");
    }

    // A ParsedParams with an lnurl in it
    function processLnurl(source: ParsedParams & { lnurl: string }) {
        setDecodingLnUrl(true);
        state.mutiny_wallet
            ?.decode_lnurl(source.lnurl)
            .then((lnurlParams) => {
                setDecodingLnUrl(false);
                if (lnurlParams.tag === "payRequest") {
                    if (lnurlParams.min == lnurlParams.max) {
                        setAmountSats(lnurlParams.min / 1000n);
                        setIsAmtEditable(false);
                    } else {
                        setAmountSats(source.amount_sats || 0n);
                    }

                    if (source.lightning_address) {
                        setLnAddress(source.lightning_address);
                        setIsHodlInvoice(
                            source.lightning_address
                                .toLowerCase()
                                .includes("zeuspay.com")
                        );
                    }
                    setLnurlp(source.lnurl);
                    setSource("lightning");
                }
                // TODO: this is a bit of a hack, ideally we do more nav from the megastore
                if (lnurlParams.tag === "withdrawRequest") {
                    actions.setScanResult(source);
                    navigate("/redeem");
                }
            })
            .catch((e) => showToast(eify(e)));
    }

    createEffect(() => {
        if (amountInput() === "") {
            setAmountSats(0n);
        } else {
            const parsed = BigInt(amountInput());
            console.log("parsed", parsed);
            if (!parsed) {
                setUnparsedAmount(true);
            }
            if (parsed > 0n) {
                setAmountSats(parsed);
                setUnparsedAmount(false);
            } else {
                setUnparsedAmount(true);
            }
        }
    });

    // If we got here from a scan or search
    onMount(() => {
        if (state.scan_result) {
            handleDestination(state.scan_result);
            actions.setScanResult(undefined);
        }
    });

    async function handleSend() {
        try {
            setSending(true);
            const bolt11 = invoice()?.bolt11;
            const sentDetails: Partial<SentDetails> = {};

            const tags = contactId() ? [contactId()!] : [];

            if (whatForInput()) {
                tags.push(whatForInput().trim());
            }

            if (source() === "lightning" && invoice() && bolt11) {
                sentDetails.destination = bolt11;
                // If the invoice has sats use that, otherwise we pass the user-defined amount
                if (invoice()?.amount_sats) {
                    const payment = await state.mutiny_wallet?.pay_invoice(
                        bolt11,
                        undefined,
                        tags
                    );
                    sentDetails.amount = payment?.amount_sats;
                    sentDetails.payment_hash = payment?.payment_hash;
                    sentDetails.fee_estimate = payment?.fees_paid || 0;
                } else {
                    const payment = await state.mutiny_wallet?.pay_invoice(
                        bolt11,
                        amountSats(),
                        tags
                    );
                    sentDetails.amount = payment?.amount_sats;
                    sentDetails.payment_hash = payment?.payment_hash;
                    sentDetails.fee_estimate = payment?.fees_paid || 0;
                }
            } else if (source() === "lightning" && nodePubkey()) {
                const payment = await state.mutiny_wallet?.keysend(
                    nodePubkey()!,
                    amountSats(),
                    undefined, // todo add optional keysend message
                    tags
                );

                // TODO: handle timeouts
                if (!payment?.paid) {
                    throw new Error(i18n.t("send.error_keysend"));
                } else {
                    sentDetails.amount = payment?.amount_sats;
                    sentDetails.payment_hash = payment?.payment_hash;
                    sentDetails.fee_estimate = payment?.fees_paid || 0;
                }
            } else if (source() === "lightning" && lnurlp()) {
                const zapNpub =
                    visibility() !== "Not Available" && contact()?.npub
                        ? contact()?.npub
                        : undefined;
                const payment = await state.mutiny_wallet?.lnurl_pay(
                    lnurlp()!,
                    amountSats(),
                    zapNpub, // zap_npub
                    tags,
                    whatForInput(), // comment
                    visibility()
                );
                sentDetails.payment_hash = payment?.payment_hash;

                if (!payment?.paid) {
                    throw new Error(i18n.t("send.error_LNURL"));
                } else {
                    sentDetails.amount = payment?.amount_sats;
                    sentDetails.payment_hash = payment?.payment_hash;
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
                } else if (payjoinEnabled()) {
                    const txid = await state.mutiny_wallet?.send_payjoin(
                        originalScan()!,
                        amountSats(),
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
            if (sentDetails.payment_hash || sentDetails.txid) {
                setSentDetails(sentDetails as SentDetails);
                await vibrateSuccess();
            } else {
                // TODO: what should we do here? hopefully this never happens?
                console.error("failed to send: no payment hash or txid");
            }
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
        return (
            unparsedAmount() ||
            parsingDestination() ||
            sending() ||
            amountSats() == 0n ||
            amountSats() === undefined ||
            !!error()
        );
    });

    const lightningMethod = createMemo<MethodChoice>(() => {
        return {
            method: "lightning",
            maxAmountSats: maxLightning()
        };
    });

    const onchainMethod = createMemo<MethodChoice>(() => {
        return {
            method: "onchain",
            maxAmountSats: maxOnchain()
        };
    });

    const sendMethods = createMemo<MethodChoice[]>(() => {
        if (lnAddress() || lnurlp() || nodePubkey()) {
            return [lightningMethod()];
        }

        if (invoice() && address()) {
            return [lightningMethod(), onchainMethod()];
        }

        if (invoice()) {
            return [lightningMethod()];
        }

        if (address()) {
            return [onchainMethod()];
        }

        // We should never get here
        console.error("No send methods found");

        return [];
    });

    function setSourceFromMethod(method: MethodChoice) {
        if (method.method === "lightning") {
            setSource("lightning");
        } else if (method.method === "onchain") {
            setSource("onchain");
        }
    }

    const activeMethod = createMemo(() => {
        if (source() === "lightning") {
            return lightningMethod();
        } else if (source() === "onchain") {
            return onchainMethod();
        }
    });

    const [visibility, setVisibility] =
        createSignal<PrivacyLevel>("Not Available");

    // If the contact has an npub and it's an lnurlp send set the default visibility to private zap
    createEffect(() => {
        contact()?.npub && lnurlp() && setVisibility("Private");
    });

    function toggleVisibility() {
        if (visibility() === "Not Available") {
            setVisibility("Private");
        } else if (visibility() === "Private") {
            setVisibility("Public");
        } else {
            setVisibility("Not Available");
        }
    }

    async function getContact(id: string) {
        console.log("fetching contact", id);
        try {
            const contact = state.mutiny_wallet?.get_tag_item(id);
            console.log("fetching contact", contact);
            // This shouldn't happen
            if (!contact) throw new Error("Contact not found");
            return contact;
        } catch (e) {
            console.error(e);
            showToast(eify(e));
        }
    }

    const [contact] = createResource(contactId, getContact);
    const location = useLocation();

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <BackPop default="/" />
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
                        const state = location.state as { previous?: string };
                        if (state?.previous) {
                            navigate(state?.previous);
                        } else {
                            navigate("/");
                        }
                    }}
                >
                    <Switch>
                        <Match when={sentDetails()?.failure_reason}>
                            <Failure
                                reason={
                                    sentDetails()?.failure_reason ||
                                    "Payment failed for an unknown reason"
                                }
                            />
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
                <div class="flex flex-1 flex-col justify-between gap-2">
                    <Suspense fallback={<LoadingShimmer />}>
                        <DestinationShower
                            source={source()}
                            description={description()}
                            invoice={invoice()}
                            address={address()}
                            nodePubkey={nodePubkey()}
                            lnurl={lnurlp()}
                            lightning_address={lnAddress()}
                            contact={contact()}
                        />
                    </Suspense>
                    <div class="flex-1" />
                    {/* Need both these versions so that we make sure to get the right initial amount on load */}
                    <Show when={isAmtEditable()}>
                        <AmountEditable
                            initialAmountSats={amountSats()}
                            setAmountSats={setAmountInput}
                            fee={feeEstimate()?.toString()}
                            onSubmit={() =>
                                sendButtonDisabled() ? undefined : handleSend()
                            }
                            activeMethod={activeMethod()}
                            methods={sendMethods()}
                            setChosenMethod={setSourceFromMethod}
                        />
                    </Show>
                    <Show when={payjoinEnabled() && source() === "onchain"}>
                        <InfoBox accent="green">
                            <p>{i18n.t("send.payjoin_send")}</p>
                        </InfoBox>
                    </Show>
                    <Show when={!isAmtEditable()}>
                        <AmountEditable
                            initialAmountSats={amountSats()}
                            setAmountSats={setAmountInput}
                            fee={feeEstimate()?.toString()}
                            frozenAmount={true}
                            onSubmit={() =>
                                sendButtonDisabled() ? undefined : handleSend()
                            }
                            activeMethod={activeMethod()}
                            methods={sendMethods()}
                            setChosenMethod={setSourceFromMethod}
                        />
                    </Show>
                    <Show when={feeEstimate()}>
                        <FeeDisplay
                            amountSats={amountSats().toString()}
                            fee={feeEstimate()!.toString()}
                            maxAmountSats={maxAmountSats()}
                        />
                    </Show>
                    <Show when={isHodlInvoice()}>
                        <InfoBox accent="red">
                            <p>{i18n.t("send.hodl_invoice_warning")}</p>
                        </InfoBox>
                    </Show>
                    <Show when={error() && !decodingLnUrl()}>
                        <InfoBox accent="red">
                            <p>{error()}</p>
                        </InfoBox>
                    </Show>
                    <div class="flex-1" />

                    <VStack>
                        <Suspense>
                            <div class="flex w-full">
                                <SharpButton
                                    onClick={toggleVisibility}
                                    // If there's no npub, or if there's an invoice, don't let switch to zap
                                    disabled={!contact()?.npub || !!invoice()}
                                >
                                    <div class="flex items-center gap-2">
                                        <Switch>
                                            <Match
                                                when={
                                                    visibility() ===
                                                    "Not Available"
                                                }
                                            >
                                                <EyeOff class="h-4 w-4" />
                                                <span>
                                                    {i18n.t("send.private")}
                                                </span>
                                            </Match>
                                            <Match
                                                when={
                                                    visibility() === "Private"
                                                }
                                            >
                                                <Zap class="h-4 w-4" />
                                                <EyeOff class="h-4 w-4" />
                                                <span>
                                                    {i18n.t("send.privatezap")}
                                                </span>
                                            </Match>
                                            <Match
                                                when={visibility() === "Public"}
                                            >
                                                <Zap class="h-4 w-4" />
                                                <Eye class="h-4 w-4" />
                                                <span>
                                                    {i18n.t("send.publiczap")}
                                                </span>
                                            </Match>
                                        </Switch>
                                    </div>
                                </SharpButton>
                            </div>
                        </Suspense>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                if (!sendButtonDisabled()) {
                                    await handleSend();
                                }
                            }}
                        >
                            <SimpleInput
                                type="text"
                                placeholder={
                                    visibility() === "Not Available"
                                        ? i18n.t("send.what_for")
                                        : i18n.t("send.zap_note")
                                }
                                onInput={(e) =>
                                    setWhatForInput(e.currentTarget.value)
                                }
                                value={whatForInput()}
                            />
                        </form>
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
                </div>
            </DefaultMain>
            <NavBar activeTab="send" />
        </MutinyWalletGuard>
    );
}
