import { NiceP } from "./layout";
import {
    For,
    Match,
    Show,
    Switch,
    createEffect,
    createResource,
    createSignal
} from "solid-js";
import { useMegaStore } from "~/state/megaStore";
import { useI18n } from "~/i18n/context";
import { Contact } from "@mutinywallet/mutiny-wasm";
import { ActivityItem, HackActivityType } from "./ActivityItem";
import { DetailsIdModal } from "./DetailsModal";
import { A } from "solid-start";
import { LoadingShimmer } from "./BalanceBox";
import { createDeepSignal } from "~/utils/deepSignal";

export const THREE_COLUMNS =
    "grid grid-cols-[auto,1fr,auto] gap-4 py-2 px-2 border-b border-neutral-800 last:border-b-0";
export const CENTER_COLUMN = "min-w-0 overflow-hidden max-w-full";
export const MISSING_LABEL =
    "py-1 px-2 bg-white/10 rounded inline-block text-sm";
export const REDSHIFT_LABEL =
    "py-1 px-2 bg-white text-m-red rounded inline-block text-sm";
export const RIGHT_COLUMN = "flex flex-col items-right text-right max-w-[8rem]";

export type OnChainTx = {
    txid: string;
    received: number;
    sent: number;
    fee?: number;
    confirmation_time?: {
        Confirmed?: {
            height: number;
            time: number;
        };
    };
    labels: string[];
};

export type UtxoItem = {
    outpoint: string;
    txout: {
        value: number;
        script_pubkey: string;
    };
    keychain: string;
    is_spent: boolean;
    redshifted?: boolean;
};

export type ActivityItem = {
    kind: HackActivityType;
    id: string;
    amount_sats: number;
    inbound: boolean;
    labels: string[];
    contacts: Contact[];
    last_updated: number;
};

function UnifiedActivityItem(props: {
    item: ActivityItem;
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

        // Some old channels don't have a channel id in the activity list
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
                <DetailsIdModal
                    open={detailsOpen()}
                    kind={detailsKind()}
                    id={detailsId()}
                    setOpen={setDetailsOpen}
                />
            </Show>
            <Switch>
                <Match when={activity.latest.length === 0}>
                    <div class="w-full text-center pb-4">
                        <NiceP>
                            {i18n.t("receive_some_sats_to_get_started")}
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
            <Show when={props.limit && activity.latest.length > 0}>
                <A
                    href="/activity"
                    class="text-m-red active:text-m-red/80 font-semibold no-underline self-center"
                >
                    {i18n.t("view_all")}
                </A>
            </Show>
        </Show>
    );
}
