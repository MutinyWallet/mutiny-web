import { TagItem } from "@mutinywallet/mutiny-wasm";
import { A } from "@solidjs/router";
import {
    createEffect,
    createResource,
    createSignal,
    For,
    Match,
    Show,
    Switch
} from "solid-js";

import {
    ActivityDetailsModal,
    ActivityItem,
    HackActivityType,
    LoadingShimmer,
    NiceP
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { createDeepSignal } from "~/utils";

interface IActivityItem {
    kind: HackActivityType;
    id: string;
    amount_sats: number;
    inbound: boolean;
    labels: string[];
    contacts: TagItem[];
    last_updated: number;
}

function UnifiedActivityItem(props: {
    item: IActivityItem;
    onClick: (id: string, kind: HackActivityType) => void;
}) {
    const click = () => {
        props.onClick(
            props.item.id,
            props.item.kind as unknown as HackActivityType
        );
    };
    return (
        <ActivityItem
            // This is actually the ActivityType enum but wasm is hard
            kind={props.item.kind as unknown as HackActivityType}
            labels={props.item.labels}
            contacts={props.item.contacts}
            // FIXME: is this something we can put into node logic?
            amount={props.item.amount_sats || 0}
            date={props.item.last_updated}
            positive={props.item.inbound}
            onClick={click}
        />
    );
}

export function CombinedActivity(props: { limit?: number }) {
    const [state, _actions] = useMegaStore();
    const i18n = useI18n();

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

    async function fetchActivity() {
        return await state.mutiny_wallet?.get_activity();
    }

    const [activity, { refetch }] = createResource(fetchActivity, {
        storage: createDeepSignal
    });

    createEffect(() => {
        // Should re-run after every sync
        if (!state.is_syncing) {
            refetch();
        }
    });

    return (
        <Show
            when={activity.state === "ready" || activity.state === "refreshing"}
            fallback={<LoadingShimmer />}
        >
            <Show when={detailsId() && detailsKind()}>
                <ActivityDetailsModal
                    open={detailsOpen()}
                    kind={detailsKind()}
                    id={detailsId()}
                    setOpen={setDetailsOpen}
                />
            </Show>
            <Switch>
                <Match when={activity.latest.length === 0}>
                    <div class="w-full pb-4 text-center">
                        <NiceP>
                            {i18n.t(
                                "activity.receive_some_sats_to_get_started"
                            )}
                        </NiceP>
                    </div>
                </Match>
                <Match
                    when={props.limit && activity.latest.length > props.limit}
                >
                    <For each={activity.latest.slice(0, props.limit)}>
                        {(activityItem) => (
                            <UnifiedActivityItem
                                item={activityItem}
                                onClick={openDetailsModal}
                            />
                        )}
                    </For>
                </Match>
                <Match when={activity.latest.length >= 0}>
                    <For each={activity.latest}>
                        {(activityItem) => (
                            <UnifiedActivityItem
                                item={activityItem}
                                onClick={openDetailsModal}
                            />
                        )}
                    </For>
                </Match>
            </Switch>
            {/* Only show on the home screen */}
            <Show when={props.limit}>
                <A
                    href="/activity"
                    class="self-center font-semibold text-m-red no-underline active:text-m-red/80"
                >
                    {i18n.t("activity.view_all")}
                </A>
            </Show>
        </Show>
    );
}
