import { TagItem } from "@mutinywallet/mutiny-wasm";
import { cache, createAsync, revalidate, useNavigate } from "@solidjs/router";
import { Plus, Save, Search, Shuffle, Users } from "lucide-solid";
import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js";

import { ActivityDetailsModal, ButtonCard, NiceP } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { timeAgo } from "~/utils";

import { GenericItem } from "./GenericItem";

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
}

export function UnifiedActivityItem(props: {
    item: IActivityItem;
    onClick: (id: string, kind: HackActivityType) => void;
}) {
    const navigate = useNavigate();

    const click = () => {
        props.onClick(
            props.item.id,
            props.item.kind as unknown as HackActivityType
        );
    };

    const primaryContact = () => {
        if (props.item.contacts.length === 0) {
            return undefined;
        }
        return props.item.contacts[0];
    };

    // TODO: figure out what other shit we should filter out
    const message = () => {
        const filtered = props.item.labels.filter(
            (l) => l !== "SWAP" && !l.startsWith("LN Channel:")
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

    return (
        <div class="pt-3 first-of-type:pt-0">
            <GenericItem
                primaryAvatarUrl={primaryContact()?.image_url || ""}
                icon={shouldShowShuffle() ? <Shuffle /> : undefined}
                primaryOnClick={() =>
                    primaryName() !== "You" && primaryContact()?.id
                        ? navigate(`/chat/${primaryContact()?.id}`)
                        : undefined
                }
                amountOnClick={click}
                primaryName={
                    props.item.inbound
                        ? primaryContact()?.name || "Unknown"
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
                    props.item.kind === "Lightning" ? "private" : undefined
                }
            />
        </div>
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

    const getActivity = cache(async () => {
        try {
            console.log("refetching activity");
            const activity = await state.mutiny_wallet?.get_activity();
            return (activity || []) as IActivityItem[];
        } catch (e) {
            console.error(e);
            return [] as IActivityItem[];
        }
    }, "activity");

    const activity = createAsync(() => getActivity(), { initialValue: [] });

    createEffect(() => {
        // Should re-run after every sync
        if (!state.is_syncing) {
            revalidate("activity");
        }
    });

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
            <Switch>
                <Match when={activity().length === 0}>
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
                <Match when={activity().length >= 0}>
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
                        <For each={activity()}>
                            {(activityItem) => (
                                <UnifiedActivityItem
                                    item={activityItem}
                                    onClick={openDetailsModal}
                                />
                            )}
                        </For>
                    </div>
                </Match>
            </Switch>
        </>
    );
}
