import { NiceP } from "./layout";
import {
    For,
    Match,
    Show,
    Switch,
    createEffect,
    createSignal,
    onMount
} from "solid-js";
import { useMegaStore } from "~/state/megaStore";
import { ActivityItem as MutinyActivity } from "@mutinywallet/mutiny-wasm";
import { ActivityItem, HackActivityType } from "./ActivityItem";
import { DetailsIdModal } from "./DetailsModal";

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

function UnifiedActivityItem(props: {
    item: MutinyActivity;
    onClick: (id: string, kind: HackActivityType) => void;
}) {
    onMount(() => {
        console.log(props.item);
    });

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
    const [state, actions] = useMegaStore();

    const [detailsOpen, setDetailsOpen] = createSignal(false);
    const [detailsKind, setDetailsKind] = createSignal<HackActivityType>();
    const [detailsId, setDetailsId] = createSignal("");

    function openDetailsModal(id: string, kind: HackActivityType) {
        console.log("Opening details modal: ", id, kind);

        setDetailsId(id);
        setDetailsKind(kind);
        setDetailsOpen(true);
    }

    createEffect(() => {
        if (!state.wallet_loading && !state.is_syncing) {
            actions.syncActivity();
        }
    });

    return (
        <>
            <Show when={detailsId() && detailsKind()}>
                <DetailsIdModal
                    open={detailsOpen()}
                    kind={detailsKind()}
                    id={detailsId()}
                    setOpen={setDetailsOpen}
                />
            </Show>
            <Switch>
                <Match when={state.activity.length === 0}>
                    <div class="w-full text-center pb-4">
                        <NiceP>Receive some sats to get started</NiceP>
                    </div>
                </Match>
                <Match
                    when={props.limit && state.activity.length > props.limit}
                >
                    <For each={state.activity.slice(0, props.limit)}>
                        {(activityItem) => (
                            <UnifiedActivityItem
                                item={activityItem}
                                onClick={openDetailsModal}
                            />
                        )}
                    </For>
                </Match>
                <Match when={state.activity.length >= 0}>
                    <For each={state.activity}>
                        {(activityItem) => (
                            <UnifiedActivityItem
                                item={activityItem}
                                onClick={openDetailsModal}
                            />
                        )}
                    </For>
                </Match>
            </Switch>
        </>
    );
}
