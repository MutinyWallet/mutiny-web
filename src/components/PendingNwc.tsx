import { TagItem } from "@mutinywallet/mutiny-wasm";
import { useNavigate } from "@solidjs/router";
import { Check, PlugZap, X } from "lucide-solid";
import {
    createEffect,
    createResource,
    createSignal,
    For,
    Match,
    Show,
    Switch
} from "solid-js";

import { ButtonCard, GenericItem, InfoBox, NiceP } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import {
    createDeepSignal,
    eify,
    veryShortTimeStamp,
    vibrateSuccess
} from "~/utils";

type PendingItem = {
    id: string;
    name_of_connection: string;
    date?: bigint;
    amount_sats?: bigint;
    image?: string;
};

export function PendingNwc() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const [error, setError] = createSignal<Error>();

    const navigate = useNavigate();

    async function fetchPendingRequests() {
        const profiles = await state.mutiny_wallet?.get_nwc_profiles();
        if (!profiles) return [];

        const contacts: TagItem[] | undefined =
            await state.mutiny_wallet?.get_contacts_sorted();
        if (!contacts) return [];

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
            } else {
                const contact = contacts.find((c) => c.npub === p.npub);
                if (contact) {
                    pendingItems.push({
                        id: p.id,
                        name_of_connection: contact.name,
                        image: contact.image_url,
                        date: p.expiry,
                        amount_sats: p.amount_sats
                    });
                }
            }
        }
        return pendingItems;
    }

    const [pendingRequests, { refetch }] = createResource(
        fetchPendingRequests,
        // Create deepsignal so we don't get flicker on refresh
        { storage: createDeepSignal }
    );

    const [payList, setPayList] = createSignal<string[]>([]);

    async function payItem(item: PendingItem) {
        try {
            // setPaying(item.id);
            setPayList([...payList(), item.id]);
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
            setPayList(payList().filter((id) => id !== item.id));
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
            setPayList([...payList(), item.id]);
            await state.mutiny_wallet?.deny_invoice(item.id);
        } catch (e) {
            setError(eify(e));
            console.error(e);
        } finally {
            setPayList(payList().filter((id) => id !== item.id));
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
        <Switch>
            <Match when={pendingRequests() && pendingRequests()!.length > 0}>
                <ButtonCard onClick={() => navigate("/settings/connections")}>
                    <div class="flex items-center gap-2">
                        <PlugZap class="inline-block text-m-red" />
                        <NiceP>{i18n.t("home.connection_edit")}</NiceP>
                    </div>
                </ButtonCard>
                <div class="flex w-full justify-around">
                    <button
                        class="flex items-center gap-1 font-semibold text-m-green active:-mb-[1px] active:mt-[1px] active:text-m-green/80"
                        onClick={approveAll}
                    >
                        <Check />
                        <span>
                            {i18n.t(
                                "settings.connections.pending_nwc.approve_all"
                            )}
                        </span>
                    </button>
                    <button
                        class="flex items-center gap-1 font-semibold text-m-red active:-mb-[1px] active:mt-[1px] active:text-m-red/80"
                        onClick={denyAll}
                    >
                        <X />
                        <span>
                            {i18n.t(
                                "settings.connections.pending_nwc.deny_all"
                            )}
                        </span>
                    </button>
                </div>
                <div class="flex w-full flex-col divide-y divide-m-grey-800 overflow-x-clip">
                    <Show when={error()}>
                        <InfoBox accent="red">{error()?.message}</InfoBox>
                    </Show>

                    <For each={pendingRequests()}>
                        {(pendingItem) => (
                            <GenericItem
                                primaryAvatarUrl={pendingItem.image || ""}
                                verb="requested"
                                amount={pendingItem.amount_sats || 0n}
                                due={veryShortTimeStamp(pendingItem.date)}
                                genericAvatar
                                primaryName={pendingItem.name_of_connection}
                                approveAction={() => payItem(pendingItem)}
                                rejectAction={() => rejectItem(pendingItem)}
                                shouldSpinny={payList().includes(
                                    pendingItem.id
                                )}
                            />
                        )}
                    </For>
                </div>
            </Match>
            <Match when={true}>
                <ButtonCard onClick={() => navigate("/settings/connections")}>
                    <div class="flex items-center gap-2">
                        <PlugZap class="inline-block text-m-red" />
                        <NiceP>{i18n.t("home.connection")}</NiceP>
                    </div>
                </ButtonCard>
            </Match>
        </Switch>
    );
}
