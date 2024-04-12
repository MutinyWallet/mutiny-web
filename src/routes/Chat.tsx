import { TagItem } from "@mutinywallet/mutiny-wasm";
import { createAsync, useNavigate, useParams } from "@solidjs/router";
import {
    ArrowDownLeft,
    ArrowUpRight,
    Check,
    MessagesSquare,
    X,
    Zap
} from "lucide-solid";
import {
    createEffect,
    createResource,
    createSignal,
    For,
    Match,
    onCleanup,
    onMount,
    Show,
    Suspense,
    Switch
} from "solid-js";

import {
    ActivityDetailsModal,
    AmountSats,
    BackPop,
    Button,
    ButtonCard,
    ContactButton,
    ContactFormValues,
    ContactViewer,
    HackActivityType,
    IActivityItem,
    LoadingShimmer,
    MutinyWalletGuard,
    NiceP,
    showToast,
    SimpleInput,
    UnifiedActivityItem
} from "~/components";
import { MiniFab } from "~/components/Fab";
import { useI18n } from "~/i18n/context";
import { ParsedParams, toParsedParams } from "~/logic/waila";
import { useMegaStore } from "~/state/megaStore";
import { eify, hexpubFromNpub, timeAgo } from "~/utils";

type CombinedMessagesAndActivity =
    | { kind: "message"; content: FakeDirectMessage }
    | { kind: "activity"; content: IActivityItem };

// TODO: Use the actual type from MutinyWallet
type FakeDirectMessage = {
    from: string;
    to: string;
    message: string;
    date: number;
};

function isActivityItem(content: unknown): content is IActivityItem {
    return (content as IActivityItem).last_updated !== undefined;
}

function isDirectMessage(content: unknown): content is FakeDirectMessage {
    return (content as FakeDirectMessage).date !== undefined;
}

function SingleMessage(props: {
    dm: FakeDirectMessage;
    counterPartyNpub: string;
    counterPartyContactId: string;
}) {
    const [state, actions] = useMegaStore();
    const network = state.mutiny_wallet?.get_network() || "signet";
    const navigate = useNavigate();

    const parsed = createAsync(
        async () => {
            let result = undefined;

            // Look for a long word that might be an invoice
            const split_message_by_whitespace = props.dm.message.split(/\s+/g);
            for (const word of split_message_by_whitespace) {
                if (word.length > 15) {
                    result = toParsedParams(word, network);
                    if (result.ok) {
                        break;
                    }
                }
            }

            if (!result || !result.ok) {
                return undefined;
            }

            if (result.value?.invoice) {
                console.log("about to get invoice");
                try {
                    const alreadyPaid = await state.mutiny_wallet?.get_invoice(
                        result.value.invoice
                    );
                    if (alreadyPaid?.paid) {
                        return {
                            type: "invoice",
                            status: "paid",
                            message_without_invoice: props.dm.message.replace(
                                result.value.original,
                                ""
                            ),
                            value: result.value.invoice,
                            amount: result.value.amount_sats
                        };
                    }
                } catch (e) {
                    // No invoice found, no worries
                }

                return {
                    type: "invoice",
                    status: "unpaid",
                    message_without_invoice: props.dm.message.replace(
                        result.value.original,
                        ""
                    ),
                    from: props.dm.from,
                    value: result.value.invoice,
                    amount: result.value.amount_sats
                };
            }
        },
        {
            initialValue: undefined
        }
    );

    function navWithContactId() {
        navigate("/send", {
            state: {
                previous: "/chat/" + props.counterPartyContactId
            }
        });
    }

    function payContact(result: ParsedParams) {
        actions.setScanResult({
            ...result,
            contact_id: props.counterPartyContactId
        });
        navWithContactId();
    }

    function handlePay(invoice: string) {
        actions.handleIncomingString(
            invoice,
            (error) => {
                showToast(error);
            },
            payContact
        );
    }

    return (
        <div
            id="message"
            class="flex max-w-[80%] flex-col rounded-lg px-4 py-2"
            classList={{
                "bg-m-grey-750 self-start":
                    props.dm.from === props.counterPartyNpub,
                "bg-m-blue self-end": props.dm.from !== props.counterPartyNpub
            }}
        >
            <Switch>
                <Match when={parsed()?.type === "invoice"}>
                    <div class="flex flex-col gap-2">
                        <Show when={parsed()?.message_without_invoice}>
                            <p class="!mb-0 break-words">
                                {parsed()?.message_without_invoice}
                            </p>
                        </Show>
                        <div class="flex items-center gap-2">
                            <Zap class="h-4 w-4" />
                            <span>Lightning Invoice</span>
                        </div>
                        <AmountSats amountSats={parsed()?.amount} />
                        <Show
                            when={
                                parsed()?.status !== "paid" &&
                                parsed()?.from === props.counterPartyNpub
                            }
                        >
                            <Button
                                intent="blue"
                                layout="xs"
                                onClick={() => handlePay(parsed()?.value || "")}
                            >
                                Pay
                            </Button>
                        </Show>
                        <Show when={parsed()?.status === "paid"}>
                            <p class="!mb-0 italic">Paid</p>
                        </Show>
                        <div />
                    </div>
                </Match>
                <Match when={true}>
                    <p class="!mb-0 !select-text break-words">
                        {props.dm.message}
                    </p>
                </Match>
            </Switch>
            <time
                class="text-xs font-light text-white/50"
                classList={{
                    "self-end": props.dm.from !== props.counterPartyNpub
                }}
            >
                {timeAgo(props.dm.date)}
            </time>
        </div>
    );
}

function MessageList(props: {
    convo: CombinedMessagesAndActivity[];
    contact: TagItem;
}) {
    let scrollRef: HTMLDivElement;

    onMount(() => {
        scrollRef.scrollIntoView();
    });

    // Details modal stuff
    const [detailsOpen, setDetailsOpen] = createSignal(false);
    const [detailsKind, setDetailsKind] = createSignal<HackActivityType>();
    const [detailsId, setDetailsId] = createSignal("");

    function openDetailsModal(id: string, kind: HackActivityType) {
        console.log("Opening details modal: ", id, kind);

        if (!id) {
            console.warn("No id provided to openDetailsModal");
            return;
        }

        setDetailsId(id);
        setDetailsKind(kind);
        setDetailsOpen(true);
    }

    return (
        <>
            <div class="flex flex-col-reverse justify-end gap-4 safe-bottom">
                <For each={props.convo}>
                    {(combined, _index) => (
                        <>
                            <Show when={combined.kind === "activity"}>
                                <div
                                    class="w-[80%] rounded-lg bg-m-grey-750 px-4 pt-4"
                                    classList={{
                                        "self-start": (
                                            combined.content as IActivityItem
                                        ).inbound,
                                        "self-end": !(
                                            combined.content as IActivityItem
                                        ).inbound
                                    }}
                                >
                                    <UnifiedActivityItem
                                        item={combined.content as IActivityItem}
                                        onClick={openDetailsModal}
                                        // This isn't applicable here
                                        onNewContactClick={() => {}}
                                    />
                                </div>
                            </Show>
                            <Show when={combined.kind === "message"}>
                                <SingleMessage
                                    dm={combined.content as FakeDirectMessage}
                                    counterPartyNpub={props.contact.npub || ""}
                                    counterPartyContactId={props.contact.id}
                                />
                            </Show>
                        </>
                    )}
                </For>
            </div>
            <div
                class="h-16"
                ref={(el) => (scrollRef = el)}
                id="scroll-to-me"
            />
            <Show when={detailsId() && detailsKind()}>
                <ActivityDetailsModal
                    open={detailsOpen()}
                    kind={detailsKind()}
                    id={detailsId()}
                    setOpen={setDetailsOpen}
                />
            </Show>
        </>
    );
}

function FixedChatHeader(props: {
    contact: TagItem;
    refetch: () => void;
    sendToContact: (contact: TagItem) => void;
    requestFromContact: (contact: TagItem) => void;
}) {
    const [state, _actions] = useMegaStore();
    const navigate = useNavigate();

    async function saveContact(id: string, contact: ContactFormValues) {
        console.log("saving contact", id, contact);
        const hexpub = await hexpubFromNpub(contact.npub?.trim());
        try {
            const existing = state.mutiny_wallet?.get_tag_item(id);
            // This shouldn't happen
            if (!existing) throw new Error("No existing contact");
            await state.mutiny_wallet?.edit_contact(
                id,
                contact.name,
                hexpub ? hexpub : undefined,
                contact.ln_address ? contact.ln_address.trim() : undefined,
                existing.lnurl,
                existing.image_url
            );
        } catch (e) {
            console.error(e);
            showToast(eify(e));
        }

        // TODO: refetch contact
        props.refetch();
    }

    async function deleteContact(id: string) {
        try {
            await state.mutiny_wallet?.delete_contact(id);
        } catch (e) {
            console.error(e);
            showToast(eify(e));
        }
        navigate("/search");
    }

    const [updatingFollowStatus, setUpdatingFollowStatus] = createSignal(false);

    async function followContact() {
        setUpdatingFollowStatus(true);

        try {
            if (!props.contact.npub) throw new Error("No npub");
            await state.mutiny_wallet?.follow_npub(props.contact.npub);
            props.refetch();
        } catch (e) {
            console.error(e);
            showToast(eify(e));
        }
        setUpdatingFollowStatus(false);
    }

    async function unfollowContact() {
        setUpdatingFollowStatus(true);

        try {
            if (!props.contact.npub) throw new Error("No npub");
            await state.mutiny_wallet?.unfollow_npub(props.contact.npub);
            props.refetch();
        } catch (e) {
            console.error(e);
            showToast(eify(e));
        }
        setUpdatingFollowStatus(false);
    }

    return (
        <div class="fixed top-0 z-50 flex w-full max-w-[600px] flex-col gap-2 bg-m-grey-975/70 px-4 py-4 backdrop-blur-lg">
            <div class="backgrop-blur-lg z-50 bg-m-grey-975/70 safe-top" />
            <div class="flex w-full flex-col gap-2">
                <div class="flex items-center gap-4">
                    <BackPop default="/" title="" />
                    <ContactViewer
                        contact={props.contact}
                        saveContact={saveContact}
                        deleteContact={deleteContact}
                    >
                        <ContactButton
                            contact={props.contact}
                            onClick={() => {}}
                        />
                    </ContactViewer>
                </div>
                <div class="flex w-full justify-around gap-4">
                    <button
                        disabled={
                            !props.contact ||
                            !(props.contact?.ln_address || props.contact?.lnurl)
                        }
                        class="flex gap-2 font-semibold text-m-green disabled:text-m-grey-350 disabled:opacity-50"
                        onClick={() => {
                            props.sendToContact(props.contact);
                        }}
                    >
                        <ArrowUpRight class="inline-block" />
                        <span>Send</span>
                    </button>
                    <Show when={props.contact?.npub}>
                        <button
                            class="flex gap-2 font-semibold text-m-blue"
                            onClick={() =>
                                props.requestFromContact(props.contact)
                            }
                        >
                            <ArrowDownLeft class="inline-block text-m-blue" />
                            <span>Request</span>
                        </button>
                        <Switch>
                            <Match when={props.contact?.is_followed}>
                                <button
                                    class="flex gap-2 font-semibold text-m-red disabled:text-m-grey-350 disabled:opacity-50"
                                    onClick={unfollowContact}
                                    disabled={updatingFollowStatus()}
                                >
                                    <X class="inline-block text-m-red" />
                                    <span>Unfollow</span>
                                </button>
                            </Match>
                            <Match when={!props.contact?.is_followed}>
                                <button
                                    class="flex gap-2 font-semibold text-white disabled:text-m-grey-350 disabled:opacity-50"
                                    onClick={followContact}
                                    disabled={updatingFollowStatus()}
                                >
                                    <Check class="inline-block text-white" />
                                    <span>Follow</span>
                                </button>
                            </Match>
                        </Switch>
                    </Show>
                </div>
            </div>
        </div>
    );
}

export function Chat() {
    const params = useParams();
    const [state, actions] = useMegaStore();

    const [messageValue, setMessageValue] = createSignal("");
    const [sending, setSending] = createSignal(false);

    const i18n = useI18n();

    // const contact = createAsync(async () => {
    //     try {
    //         return state.mutiny_wallet?.get_tag_item(params.id);
    //     } catch (e) {
    //         console.error("couldn't find contact");
    //         console.error(e);
    //         return undefined;
    //     }
    // });

    const [contact, { refetch: refetchContact }] = createResource(async () => {
        try {
            return state.mutiny_wallet?.get_tag_item(params.id);
        } catch (e) {
            console.error("couldn't find contact");
            console.error(e);
            return undefined;
        }
    });

    const [convo, { refetch }] = createResource(
        contact,
        async (contact?: TagItem) => {
            if (!contact || !contact?.npub) return undefined;
            if (!contact.npub) return [] as CombinedMessagesAndActivity[];
            try {
                let acts = [] as IActivityItem[];
                let dms = [] as FakeDirectMessage[];

                try {
                    acts = (await state.mutiny_wallet?.get_label_activity(
                        params.id
                    )) as IActivityItem[];
                } catch (e) {
                    console.error("error getting activity:", e);
                }

                try {
                    dms = (await state.mutiny_wallet?.get_dm_conversation(
                        contact.npub,
                        20n,
                        undefined,
                        undefined
                    )) as FakeDirectMessage[];
                } catch (e) {
                    console.error("error getting dms:", e);
                }

                // Combine both arrays into an array of CombinedMessagesAndActivity, then sort by date
                const combined = [
                    ...dms.map((dm) => ({
                        kind: "message",
                        content: dm
                    })),
                    ...acts.map((act) => ({
                        kind: "activity",
                        content: act
                    }))
                ];

                combined.sort((a, b) => {
                    const a_time = isDirectMessage(a.content)
                        ? a.content.date
                        : isActivityItem(a.content)
                          ? a.content.last_updated
                          : 0;
                    const b_time = isDirectMessage(b.content)
                        ? b.content.date
                        : isActivityItem(b.content)
                          ? b.content.last_updated
                          : 0;

                    return b_time - a_time; // Descending order
                });

                console.log("combined activity", combined);

                return combined as CombinedMessagesAndActivity[];
            } catch (e) {
                console.error("error getting convo:", e);
                return [] as CombinedMessagesAndActivity[];
            }
        }
    );

    async function sendMessage() {
        const npub = contact()?.npub;
        if (!npub) return;
        setSending(true);
        const rememberedValue = messageValue();
        setMessageValue("");
        try {
            const dmResult = await state.mutiny_wallet?.send_dm(
                npub,
                rememberedValue
            );
            console.log("dmResult:", dmResult);
            refetch();
        } catch (e) {
            console.error("error sending dm:", e);
        }
        setSending(false);
    }

    createEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 5000); // Poll every 5 seconds
        onCleanup(() => {
            clearInterval(interval);
        });
    });

    function sendToContact(contact?: TagItem) {
        if (!contact) return;
        const address = contact.ln_address || contact.lnurl;
        if (address) {
            actions.handleIncomingString(
                (address || "").trim(),
                (error) => {
                    showToast(error);
                },
                (result) => {
                    actions.setScanResult({
                        ...result,
                        contact_id: contact.id
                    });
                    navWithContactId();
                }
            );
        } else {
            console.error("no ln_address or lnurl");
        }
    }

    function requestFromContact(contact?: TagItem) {
        if (!contact) return;
        navigate("/request/" + contact.id, {
            state: {
                previous: "/chat/" + params.id
            }
        });
    }

    const navigate = useNavigate();

    function navWithContactId() {
        navigate("/send", {
            state: {
                previous: "/chat/" + params.id
            }
        });
    }

    return (
        <MutinyWalletGuard>
            <Show when={contact()}>
                <FixedChatHeader
                    contact={contact()!}
                    refetch={refetchContact}
                    requestFromContact={requestFromContact}
                    sendToContact={sendToContact}
                />
            </Show>

            <div class="h-[8rem]" />
            {/* <pre class="whitespace-pre-wrap break-all">
                            {JSON.stringify(convo(), null, 2)}
                        </pre> */}
            <div class="p-4">
                <Suspense>
                    <Show when={contact()}>
                        <Suspense fallback={<LoadingShimmer />}>
                            <Switch>
                                <Match
                                    when={
                                        convo.latest && convo.latest.length > 0
                                    }
                                >
                                    {/* TODO: figure out how not to do typecasting here */}
                                    <MessageList
                                        convo={
                                            convo.latest as CombinedMessagesAndActivity[]
                                        }
                                        contact={contact()!}
                                    />
                                </Match>
                                <Match when={contact() && contact()?.npub}>
                                    <ButtonCard
                                        onClick={() =>
                                            requestFromContact(contact())
                                        }
                                    >
                                        <div class="flex items-center gap-4 text-left">
                                            <div class="flex-0">
                                                <MessagesSquare class="inline-block text-m-red" />
                                            </div>
                                            <NiceP>
                                                {i18n.t("chat.prompt")}
                                            </NiceP>
                                        </div>
                                    </ButtonCard>
                                </Match>
                            </Switch>
                        </Suspense>
                    </Show>
                </Suspense>
            </div>
            <Show when={contact() && contact()?.npub}>
                <div class="fixed bottom-0 grid w-full max-w-[600px] grid-cols-[auto_1fr_auto] grid-rows-1 items-center gap-2 bg-m-grey-975/70 px-4 py-2 backdrop-blur-lg">
                    <MiniFab
                        onScan={() => navigate("/scanner")}
                        onSend={() => {
                            sendToContact(contact());
                        }}
                        sendDisabled={
                            !contact() ||
                            !(contact()?.ln_address || contact()?.lnurl)
                        }
                        onRequest={() => requestFromContact(contact())}
                    />
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            await sendMessage();
                        }}
                    >
                        <SimpleInput
                            disabled={sending()}
                            value={messageValue()}
                            onInput={(e) =>
                                setMessageValue(e.currentTarget.value)
                            }
                            placeholder={i18n.t("chat.placeholder")}
                        />
                    </form>
                    <div>
                        <Show when={messageValue() || sending()}>
                            <Button
                                layout="xs"
                                intent="blue"
                                loading={sending()}
                                onClick={sendMessage}
                            >
                                Send
                            </Button>
                        </Show>
                    </div>
                    <div class="backgrop-blur-lg z-50 bg-m-grey-975/70 safe-bottom" />
                </div>
            </Show>
        </MutinyWalletGuard>
    );
}
