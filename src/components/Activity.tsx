import { TagItem } from "@mutinywallet/mutiny-wasm";
import { cache, createAsync, useNavigate } from "@solidjs/router";
import { Plus, Save, Search, Shuffle, Users } from "lucide-solid";
import {
    createEffect,
    createMemo,
    createResource,
    createSignal,
    For,
    Match,
    Show,
    Suspense,
    Switch
} from "solid-js";

import {
    ActivityDetailsModal,
    Button,
    ButtonCard,
    ContactButton,
    NiceP,
    SimpleDialog
} from "~/components";
import { useI18n } from "~/i18n/context";
import { PrivacyLevel } from "~/routes";
import { useMegaStore } from "~/state/megaStore";
import {
    actuallyFetchNostrProfile,
    createDeepSignal,
    hexpubFromNpub,
    profileToPseudoContact,
    PseudoContact,
    timeAgo
} from "~/utils";

import { GenericItem } from "./GenericItem";

const ZAPPLE_PAY_NPUB =
    "npub1wxl6njlcgygduct7jkgzrvyvd9fylj4pqvll6p32h59wyetm5fxqjchcan";

export type HackActivityType =
    | "Lightning"
    | "OnChain"
    | "ChannelOpen"
    | "ChannelClose";

export interface IActivityItem {
    kind: HackActivityType;
    id: string;
    amount_sats: number;
    inbound: boolean;
    labels: string[];
    contacts: TagItem[];
    last_updated: number;
    privacy_level: PrivacyLevel;
}

async function fetchContactForNpub(
    npub: string
): Promise<PseudoContact | undefined> {
    const hexpub = await hexpubFromNpub(npub);
    if (!hexpub) {
        return undefined;
    }
    const profile = await actuallyFetchNostrProfile(hexpub);
    if (!profile) {
        return undefined;
    }
    const pseudoContact = profileToPseudoContact(profile);
    return pseudoContact;
}

export function UnifiedActivityItem(props: {
    item: IActivityItem;
    onClick: (id: string, kind: HackActivityType) => void;
    onNewContactClick: (profile: PseudoContact) => void;
}) {
    const navigate = useNavigate();

    const click = () => {
        props.onClick(
            props.item.id,
            props.item.kind as unknown as HackActivityType
        );
    };

    const primaryContact = createMemo(() => {
        if (props.item.contacts.length === 0) {
            return undefined;
        }
        // if it's a zapple pay, don't show the contact, parse the label
        const contact = props.item.contacts[0];
        if (contact.npub && contact.npub === ZAPPLE_PAY_NPUB) {
            return undefined;
        }
        return contact;
    });

    const getContact = cache(async (npub) => {
        return await fetchContactForNpub(npub);
    }, "profile");

    const profileFromNostr = createAsync(async () => {
        if (props.item.contacts.length === 0) {
            if (props.item.labels) {
                const npub = props.item.labels.find((l) =>
                    l.startsWith("npub")
                );
                if (npub) {
                    await new Promise((r) => setTimeout(r, 1000));
                    try {
                        const newContact = await getContact(npub);
                        return newContact;
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        } else if (
            // if zapple pay, handle it specially
            props.item.contacts[0].npub === ZAPPLE_PAY_NPUB
        ) {
            if (props.item.labels) {
                const label = props.item.labels.find((l) =>
                    l.startsWith("From: nostr:npub")
                );
                if (label) {
                    // get the npub from the label
                    const npub = label.split("From: nostr:")[1];
                    await new Promise((r) => setTimeout(r, 1000));
                    try {
                        return await getContact(npub.trim());
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }
        return undefined;
    });

    // TODO: figure out what other shit we should filter out
    const message = () => {
        const filtered = props.item.labels.filter(
            (l) =>
                l !== "SWAP" &&
                !l.startsWith("LN Channel:") &&
                !l.startsWith("npub") &&
                !l.startsWith("From: nostr:npub")
        );
        if (filtered.length === 0) {
            return undefined;
        }

        return filtered[0];
    };

    const shouldShowShuffle = () => {
        return (
            props.item.kind === "ChannelOpen" ||
            props.item.kind === "ChannelClose" ||
            (props.item.labels.length > 0 && props.item.labels[0] === "SWAP")
        );
    };

    const verb = () => {
        if (props.item.kind === "ChannelOpen") {
            return "opened a";
        }
        if (props.item.kind === "ChannelClose") {
            return "closed a";
        }
        if (props.item.labels.length > 0 && props.item.labels[0] === "SWAP") {
            return "swapped to";
        }
        if (
            props.item.labels.length > 0 &&
            props.item.labels[0] === "Swept Force Close"
        ) {
            return undefined;
        }

        return "sent";
    };

    const primaryName = () => {
        return props.item.inbound ? primaryContact()?.name || "Unknown" : "You";
    };

    const secondaryName = () => {
        if (props.item.labels.length > 0 && props.item.labels[0] === "SWAP") {
            return "Lightning";
        }
        if (
            props.item.kind === "ChannelOpen" ||
            props.item.kind === "ChannelClose"
        ) {
            return "Lightning channel";
        }
        if (!props.item.inbound) {
            return primaryContact()?.name || "Unknown";
        }
        return "you";
    };

    const shouldShowGeneric = () => {
        if (props.item.inbound && primaryName() === "Unknown") {
            return true;
        }

        if (!props.item.inbound && secondaryName() === "Unknown") {
            return true;
        }
    };

    function handlePrimaryOnClick() {
        if (primaryContact()?.id) {
            navigate(`/chat/${primaryContact()?.id}`);
            return;
        }

        if (profileFromNostr()) {
            props.onNewContactClick(profileFromNostr()!);
            return;
        }

        if (
            props.item.kind === "ChannelOpen" ||
            props.item.kind === "ChannelClose"
        ) {
            click();
        }
    }

    return (
        <div class="pt-3 first-of-type:pt-0">
            <Suspense
                fallback={
                    <GenericItem
                        amountOnClick={click}
                        primaryName="Unknown"
                        genericAvatar={true}
                        verb={verb()}
                        message={message()}
                        secondaryName={secondaryName()}
                        amount={
                            props.item.amount_sats
                                ? BigInt(props.item.amount_sats || 0)
                                : undefined
                        }
                        date={timeAgo(props.item.last_updated)}
                        accent={props.item.inbound ? "green" : undefined}
                        visibility={
                            props.item.privacy_level === "Public"
                                ? "public"
                                : "private"
                        }
                    />
                }
            >
                <GenericItem
                    primaryAvatarUrl={
                        primaryContact()?.image_url
                            ? primaryContact()?.image_url
                            : profileFromNostr()?.primal_image_url || ""
                    }
                    icon={shouldShowShuffle() ? <Shuffle /> : undefined}
                    primaryOnClick={handlePrimaryOnClick}
                    amountOnClick={click}
                    primaryName={
                        props.item.inbound
                            ? primaryContact()?.name
                                ? primaryContact()!.name
                                : profileFromNostr()?.name || "Unknown"
                            : "You"
                    }
                    genericAvatar={shouldShowGeneric()}
                    verb={verb()}
                    message={message()}
                    secondaryName={secondaryName()}
                    amount={
                        props.item.amount_sats
                            ? BigInt(props.item.amount_sats || 0)
                            : undefined
                    }
                    date={timeAgo(props.item.last_updated)}
                    accent={props.item.inbound ? "green" : undefined}
                    visibility={
                        props.item.privacy_level === "Public"
                            ? "public"
                            : "private"
                    }
                />
            </Suspense>
        </div>
    );
}

function NewContactModal(props: { profile: PseudoContact; close: () => void }) {
    const i18n = useI18n();
    const navigate = useNavigate();

    const [state, _actions] = useMegaStore();

    async function createContact() {
        try {
            const existingContact =
                await state.mutiny_wallet?.get_contact_for_npub(
                    props.profile.hexpub
                );

            if (existingContact) {
                navigate(`/chat/${existingContact.id}`);
                return;
            }

            const contactId = await state.mutiny_wallet?.create_new_contact(
                props.profile.name,
                props.profile.hexpub,
                props.profile.ln_address,
                props.profile.lnurl,
                props.profile.image_url
            );

            if (!contactId) {
                throw new Error("no contact id returned");
            }

            const tagItem = await state.mutiny_wallet?.get_tag_item(contactId);

            if (!tagItem) {
                throw new Error("no contact returned");
            }

            navigate(`/chat/${contactId}`);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <SimpleDialog
            title={i18n.t("activity.start_a_chat")}
            open
            setOpen={() => {
                props.close();
            }}
        >
            <NiceP>{i18n.t("activity.start_a_chat_are_you_sure")}</NiceP>
            <ContactButton contact={props.profile} onClick={() => {}} />
            <div class="flex-end flex w-full justify-end gap-2">
                <Button
                    layout="small"
                    intent="red"
                    onClick={() => props.close()}
                >
                    {i18n.t("modals.confirm_dialog.cancel")}
                </Button>
                <Button layout="small" intent="blue" onClick={createContact}>
                    {i18n.t("common.continue")}
                </Button>
            </div>
        </SimpleDialog>
    );
}

export function CombinedActivity() {
    const [state, _actions] = useMegaStore();
    const i18n = useI18n();

    const [detailsOpen, setDetailsOpen] = createSignal(false);
    const [detailsKind, setDetailsKind] = createSignal<HackActivityType>();
    const [detailsId, setDetailsId] = createSignal("");
    const navigate = useNavigate();

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

    async function getActivity() {
        try {
            console.log("refetching activity");
            const activity = await state.mutiny_wallet?.get_activity(
                50,
                undefined
            );

            if (!activity) return [];

            return activity as IActivityItem[];
        } catch (e) {
            console.error(e);
            return [] as IActivityItem[];
        }
    }

    const [activity, { refetch }] = createResource(getActivity, {
        initialValue: [],
        storage: createDeepSignal
    });

    createEffect(() => {
        // Should re-run after every sync
        if (!state.is_syncing) {
            refetch();
        }
    });

    const [newContact, setNewContact] = createSignal<PseudoContact>();

    return (
        <>
            <Show when={detailsId() && detailsKind()}>
                <ActivityDetailsModal
                    open={detailsOpen()}
                    kind={detailsKind()}
                    id={detailsId()}
                    setOpen={setDetailsOpen}
                />
            </Show>
            <Show when={newContact()}>
                <NewContactModal
                    profile={newContact()!}
                    close={() => setNewContact(undefined)}
                />
            </Show>
            <Switch>
                <Match when={activity.latest.length === 0}>
                    <Show when={state.federations?.length === 0}>
                        <ButtonCard
                            onClick={() => navigate("/settings/federations")}
                        >
                            <div class="flex items-center gap-2">
                                <Users class="inline-block text-m-red" />
                                <NiceP>{i18n.t("home.federation")}</NiceP>
                            </div>
                        </ButtonCard>
                    </Show>
                    <ButtonCard onClick={() => navigate("/receive")}>
                        <div class="flex items-center gap-2">
                            <Plus class="inline-block text-m-red" />
                            <NiceP>{i18n.t("home.receive")}</NiceP>
                        </div>
                    </ButtonCard>
                    <ButtonCard onClick={() => navigate("/search")}>
                        <div class="flex items-center gap-2">
                            <Search class="inline-block text-m-red" />
                            <NiceP>{i18n.t("home.find")}</NiceP>
                        </div>
                    </ButtonCard>
                    <Show when={!state.has_backed_up}>
                        <ButtonCard
                            onClick={() => navigate("/settings/backup")}
                        >
                            <div class="flex items-center gap-2">
                                <Save class="inline-block text-m-red" />
                                <NiceP>{i18n.t("home.backup")}</NiceP>
                            </div>
                        </ButtonCard>
                    </Show>
                </Match>
                <Match when={activity.latest.length >= 0}>
                    <Show when={!state.has_backed_up}>
                        <ButtonCard
                            onClick={() => navigate("/settings/backup")}
                        >
                            <div class="flex items-center gap-2">
                                <Save class="inline-block text-m-red" />
                                <NiceP>{i18n.t("home.backup")}</NiceP>
                            </div>
                        </ButtonCard>
                    </Show>
                    <div class="flex w-full flex-col divide-y divide-m-grey-800 overflow-x-clip">
                        <For each={activity.latest}>
                            {(activityItem) => (
                                <UnifiedActivityItem
                                    item={activityItem}
                                    onClick={openDetailsModal}
                                    onNewContactClick={setNewContact}
                                />
                            )}
                        </For>
                    </div>
                </Match>
            </Switch>
        </>
    );
}
