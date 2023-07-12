import { NwcProfile } from "@mutinywallet/mutiny-wasm";
import { timeAgo } from "~/utils/prettyPrintTime";
import { Card, LoadingSpinner, VStack } from "./layout";
import bolt from "~/assets/icons/bolt.svg";
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

import greenCheck from "~/assets/icons/green-check.svg";
import redClose from "~/assets/icons/red-close.svg";
import { ActivityAmount } from "./ActivityItem";
import { InfoBox } from "./InfoBox";
import eify from "~/utils/eify";
import { A } from "solid-start";
import { createDeepSignal } from "~/utils/deepSignal";

type PendingItem = {
    id: string;
    name_of_connection: string;
    date?: bigint;
    amount_sats?: bigint;
};

export function PendingNwc() {
    const [state, _actions] = useMegaStore();

    const [error, setError] = createSignal<Error>();

    async function fetchPendingRequests() {
        const profiles: NwcProfile[] =
            await state.mutiny_wallet?.get_nwc_profiles();

        const pending = await state.mutiny_wallet?.get_pending_nwc_invoices();

        const pendingItems: PendingItem[] = [];

        for (const p of pending) {
            const profile = profiles.find((pro) => pro.index === p.index);

            if (profile) {
                pendingItems.push({
                    id: p.id,
                    name_of_connection: profile.name,
                    date: p.expiry,
                    amount_sats: p.amount_sats
                });
            }
        }
        return pendingItems;
    }

    const [pendingRequests, { refetch }] = createResource(
        fetchPendingRequests,
        // Create deepsignal so we don't get flicker on refresh
        { storage: createDeepSignal }
    );

    const [paying, setPaying] = createSignal<string>("");

    async function payItem(item: PendingItem) {
        try {
            setPaying(item.id);
            const nodes = await state.mutiny_wallet?.list_nodes();
            await state.mutiny_wallet?.approve_invoice(item.id, nodes[0]);
        } catch (e) {
            setError(eify(e));
            console.error(e);
        } finally {
            setPaying("");
            refetch();
        }
    }

    async function rejectItem(item: PendingItem) {
        try {
            setPaying(item.id);
            await state.mutiny_wallet?.deny_invoice(item.id);
        } catch (e) {
            setError(eify(e));
            console.error(e);
        } finally {
            setPaying("");
            refetch();
        }
    }

    createEffect(() => {
        // When there's an error wait five seconds and then clear it
        if (error()) {
            setTimeout(() => {
                setError(undefined);
            }, 5000);
        }
    });

    createEffect(() => {
        // Refetch on the sync interval
        if (!state.is_syncing) {
            refetch();
        }
    });

    return (
        <Show when={pendingRequests() && pendingRequests()!.length > 0}>
            <Card title="Pending Requests">
                <div class="p-1" />
                <VStack>
                    <Show when={error()}>
                        <InfoBox accent="red">{error()?.message}</InfoBox>
                    </Show>
                    <For each={pendingRequests()}>
                        {(pendingItem) => (
                            <div class="grid grid-cols-[auto_minmax(0,_1fr)_minmax(0,_max-content)_auto] items-center pb-4 gap-4 border-b border-neutral-800 last:border-b-0">
                                <img
                                    class="w-[1rem]"
                                    src={bolt}
                                    alt="onchain"
                                />
                                <div class="flex flex-col">
                                    <span class="text-base font-semibold truncate">
                                        {pendingItem.name_of_connection}
                                    </span>
                                    <time class="text-sm text-neutral-500">
                                        Expires {timeAgo(pendingItem.date)}
                                    </time>
                                </div>
                                <div>
                                    <ActivityAmount
                                        amount={
                                            pendingItem.amount_sats?.toString() ||
                                            "0"
                                        }
                                        price={state.price}
                                    />
                                </div>
                                <div class="flex gap-2 w-[5rem]">
                                    <Switch>
                                        <Match
                                            when={paying() !== pendingItem.id}
                                        >
                                            <button
                                                onClick={() =>
                                                    payItem(pendingItem)
                                                }
                                            >
                                                <img
                                                    class="h-[2.5rem] w-[2.5rem]"
                                                    src={greenCheck}
                                                    alt="Approve"
                                                />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    rejectItem(pendingItem)
                                                }
                                            >
                                                <img
                                                    class="h-[2rem] w-[2rem]"
                                                    src={redClose}
                                                    alt="Reject"
                                                />
                                            </button>
                                        </Match>
                                        <Match
                                            when={paying() === pendingItem.id}
                                        >
                                            <LoadingSpinner wide />
                                        </Match>
                                    </Switch>
                                </div>
                            </div>
                        )}
                    </For>
                </VStack>
                <A
                    href="/settings/connections"
                    class="text-m-red active:text-m-red/80 font-semibold no-underline self-center"
                >
                    Configure
                </A>
            </Card>
        </Show>
    );
}
