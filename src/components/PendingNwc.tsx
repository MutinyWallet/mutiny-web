import {
    createEffect,
    createResource,
    createSignal,
    For,
    Match,
    Show,
    Switch
} from "solid-js";

import bolt from "~/assets/icons/bolt.svg";
import greenCheck from "~/assets/icons/green-check.svg";
import redClose from "~/assets/icons/red-close.svg";
import {
    ActivityAmount,
    Card,
    InfoBox,
    LoadingSpinner,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import {
    createDeepSignal,
    eify,
    formatExpiration,
    vibrateSuccess
} from "~/utils";

type PendingItem = {
    id: string;
    name_of_connection: string;
    date?: bigint;
    amount_sats?: bigint;
};

export function PendingNwc() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const [error, setError] = createSignal<Error>();

    async function fetchPendingRequests() {
        const profiles = await state.mutiny_wallet?.get_nwc_profiles();
        if (!profiles) return [];

        const pending = await state.mutiny_wallet?.get_pending_nwc_invoices();
        if (!pending) return [];

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
            await state.mutiny_wallet?.approve_invoice(item.id);
            await vibrateSuccess();
        } catch (e) {
            const err = eify(e);
            // If we've already paid this invoice, just ignore the error
            // we just want to remove it from the list and continue
            if (err.message === "An invoice must not get payed twice.") {
                // wrap in try/catch so we don't crash if the invoice is already gone
                try {
                    await state.mutiny_wallet?.deny_invoice(item.id);
                } catch (_e) {
                    // do nothing
                }
            } else {
                setError(err);
                console.error(e);
            }
        } finally {
            setPaying("");
            refetch();
        }
    }

    async function approveAll() {
        // clone the list so it doesn't update in place
        const toApprove = [...pendingRequests()!];
        for (const item of toApprove) {
            await payItem(item);
        }
    }

    async function denyAll() {
        try {
            await state.mutiny_wallet?.deny_all_pending_nwc();
        } catch (e) {
            setError(eify(e));
            console.error(e);
        } finally {
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
            <Card title={i18n.t("settings.connections.pending_nwc.title")}>
                <div class="p-1" />
                <VStack>
                    <Show when={error()}>
                        <InfoBox accent="red">{error()?.message}</InfoBox>
                    </Show>
                    <For each={pendingRequests()}>
                        {(pendingItem) => (
                            <div class="grid grid-cols-[auto_minmax(0,_1fr)_minmax(0,_max-content)_auto] items-center gap-4 border-b border-neutral-800 pb-4 last:border-b-0">
                                <img
                                    class="w-[1rem]"
                                    src={bolt}
                                    alt="onchain"
                                />
                                <div class="flex flex-col">
                                    <span class="truncate text-base font-semibold">
                                        {pendingItem.name_of_connection}
                                    </span>
                                    <time class="text-sm text-neutral-500">
                                        {formatExpiration(pendingItem.date)}
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
                                <div class="flex w-[5rem] gap-2">
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
                <div class="flex w-full justify-around">
                    <button
                        class="font-semibold text-m-green active:text-m-red/80"
                        onClick={approveAll}
                    >
                        {i18n.t("settings.connections.pending_nwc.approve_all")}
                    </button>
                    <button
                        class="font-semibold text-m-red active:text-m-red/80"
                        onClick={denyAll}
                    >
                        {i18n.t("settings.connections.pending_nwc.deny_all")}
                    </button>
                </div>
            </Card>
        </Show>
    );
}
