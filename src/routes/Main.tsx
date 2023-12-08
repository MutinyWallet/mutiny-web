import { A } from "@solidjs/router";
import { Show, Suspense } from "solid-js";

import scan from "~/assets/icons/scan.svg";
import settings from "~/assets/icons/settings.svg";
import {
    BalanceBox,
    BetaWarningModal,
    Card,
    CombinedActivity,
    DecryptDialog,
    DefaultMain,
    HomePrompt,
    IOSbanner,
    LoadingIndicator,
    LoadingShimmer,
    Logo,
    NavBar,
    OnboardWarning,
    PendingNwc,
    ReloadPrompt,
    SafeArea,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { FeedbackLink } from "~/routes/Feedback";
import { useMegaStore } from "~/state/megaStore";
import { iosNotNative } from "~/utils/platform";

export function Main() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const safari = iosNotNative();

    return (
        <SafeArea>
            <DefaultMain>
                <LoadingIndicator />
                <header class="mb-2 flex w-full items-center justify-between">
                    <div class="flex items-center gap-2">
                        <Logo />
                        <Show
                            when={
                                !state.wallet_loading &&
                                state.mutiny_wallet?.get_network() !== "bitcoin"
                            }
                        >
                            <div class="text-white-400 -my-1 box-border w-fit rounded bg-neutral-800 px-2 py-1 text-xs  uppercase">
                                {state.mutiny_wallet?.get_network()}
                            </div>
                        </Show>
                        <Show when={state.settings?.selfhosted === "true"}>
                            <div class="text-white-400 -my-1 box-border w-fit rounded bg-neutral-800 px-2 py-1 text-xs  uppercase">
                                {i18n.t("common.self_hosted")}
                            </div>
                        </Show>
                    </div>
                    <div class="flex items-center gap-2">
                        <A
                            class="rounded-lg p-2 hover:bg-white/5 active:bg-m-blue md:hidden"
                            href="/scanner"
                        >
                            <img src={scan} alt="Scan" class="h-6 w-6" />
                        </A>
                        <A
                            class="rounded-lg p-2 hover:bg-white/5 active:bg-m-blue md:hidden"
                            href="/settings"
                        >
                            <img
                                src={settings}
                                alt="Settings"
                                class="h-6 w-6"
                            />
                        </A>
                    </div>
                </header>
                <Show when={!state.wallet_loading}>
                    <Show when={safari && !state.testflightPromptDismissed}>
                        <IOSbanner />
                    </Show>
                    <OnboardWarning />
                    <ReloadPrompt />
                </Show>
                <BalanceBox loading={state.wallet_loading} />
                <Suspense>
                    <Show when={!state.wallet_loading && !state.safe_mode}>
                        <PendingNwc />
                    </Show>
                </Suspense>
                <Card title={i18n.t("activity.title")}>
                    <div class="p-1" />
                    <VStack>
                        <Suspense>
                            <Show
                                when={!state.wallet_loading}
                                fallback={<LoadingShimmer />}
                            >
                                <CombinedActivity limit={3} />
                            </Show>
                        </Suspense>
                    </VStack>
                </Card>
                <div class="flex-shrink-0 self-center pb-8 pt-4">
                    <FeedbackLink />
                </div>
            </DefaultMain>
            <DecryptDialog />
            <BetaWarningModal />
            <HomePrompt />
            <NavBar activeTab="home" />
        </SafeArea>
    );
}
