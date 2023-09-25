import { Match, Show, Suspense, Switch } from "solid-js";
import { A } from "solid-start";

import settings from "~/assets/icons/settings.svg";
import pixelLogo from "~/assets/mutiny-pixel-logo.png";
import plusLogo from "~/assets/mutiny-plus-logo.png";
import {
    BalanceBox,
    BetaWarningModal,
    Card,
    CombinedActivity,
    DecryptDialog,
    DefaultMain,
    LoadingIndicator,
    LoadingShimmer,
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

export default function App() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    return (
        <SafeArea>
            <DefaultMain>
                <LoadingIndicator />
                <header class="mb-2 mt-4 flex w-full items-center justify-between">
                    <div class="flex items-center gap-2">
                        <Switch>
                            <Match when={state.mutiny_plus}>
                                <img
                                    id="mutiny-logo"
                                    src={plusLogo}
                                    class="h-[25px] w-[86px]"
                                    alt="Mutiny Plus logo"
                                />
                            </Match>
                            <Match when={true}>
                                <img
                                    id="mutiny-logo"
                                    src={pixelLogo}
                                    class="h-[25px] w-[75px]"
                                    alt="Mutiny logo"
                                />
                            </Match>
                        </Switch>
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
                    </div>
                    <A
                        class="rounded-lg p-2 hover:bg-white/5 active:bg-m-blue md:hidden"
                        href="/settings"
                    >
                        <img src={settings} alt="Settings" class="h-6 w-6" />
                    </A>
                </header>
                <Show when={!state.wallet_loading}>
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
                <div class="mt-4 self-center">
                    <FeedbackLink />
                </div>
            </DefaultMain>
            <DecryptDialog />
            <BetaWarningModal />
            <NavBar activeTab="home" />
        </SafeArea>
    );
}
