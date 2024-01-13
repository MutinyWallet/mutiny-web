import { useSearchParams } from "@solidjs/router";
import {
    createEffect,
    createResource,
    createSignal,
    Show,
    Suspense
} from "solid-js";

import {
    CombinedActivity,
    LoadingShimmer,
    NostrActivity,
    PendingNwc,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function HomeSubnav() {
    const [state, _actions] = useMegaStore();

    const i18n = useI18n();

    const [params] = useSearchParams<{
        tab: "me" | "everybody" | "requests";
    }>();

    const [activeView, setActiveView] = createSignal<
        "me" | "everybody" | "requests"
    >(params.tab || "me");

    const [pending, { refetch }] = createResource(async () => {
        try {
            const pending =
                await state.mutiny_wallet?.get_pending_nwc_invoices();
            return pending?.length || 0;
        } catch (e) {
            console.error(e);
            return 0;
        }
    });

    createEffect(() => {
        if (state.is_syncing) {
            refetch();
        }
    });

    return (
        <>
            <div class="flex gap-2">
                <button
                    class="rounded px-2 py-1 text-sm"
                    classList={{
                        "bg-m-red": activeView() === "me",
                        "bg-m-grey-800 text-m-grey-400": activeView() !== "me"
                    }}
                    onClick={() => setActiveView("me")}
                >
                    {i18n.t("home.subnav.just_me")}
                </button>
                <button
                    class="rounded px-2 py-1 text-sm"
                    classList={{
                        "bg-m-red": activeView() === "everybody",
                        "bg-m-grey-800 text-m-grey-400":
                            activeView() !== "everybody"
                    }}
                    onClick={() => setActiveView("everybody")}
                >
                    {i18n.t("home.subnav.friends")}
                </button>

                <button
                    class="flex items-center gap-1 rounded px-2 py-1 text-sm"
                    classList={{
                        "bg-m-red": activeView() === "requests",
                        "bg-m-grey-800 text-m-grey-400":
                            activeView() !== "requests"
                    }}
                    onClick={() => setActiveView("requests")}
                >
                    <span>{i18n.t("home.subnav.requests")}</span>
                    <Suspense fallback={<></>}>
                        <Show when={pending.latest && pending.latest > 0}>
                            <span
                                class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs"
                                classList={{
                                    "text-white": !!((pending.latest || 0) > 0)
                                }}
                            >
                                {pending()}
                            </span>
                        </Show>
                    </Suspense>
                </button>
            </div>

            <Show when={activeView() === "me"}>
                <VStack>
                    <Suspense>
                        <Show
                            when={!state.wallet_loading}
                            fallback={<LoadingShimmer />}
                        >
                            <CombinedActivity />
                        </Show>
                    </Suspense>
                </VStack>
            </Show>
            <Show when={activeView() === "everybody"}>
                <Suspense fallback={<LoadingShimmer />}>
                    <NostrActivity />
                </Suspense>
            </Show>
            <Show when={activeView() === "requests"}>
                <Suspense fallback={<LoadingShimmer />}>
                    <Show when={!state.wallet_loading && !state.safe_mode}>
                        <PendingNwc />
                    </Show>
                </Suspense>
            </Show>
            {/* spacer just so we can always scroll above the fab */}
            <div class="h-[4rem]" />
        </>
    );
}
