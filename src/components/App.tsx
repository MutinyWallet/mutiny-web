import { DefaultMain, SafeArea, VStack, Card } from "~/components/layout";
import BalanceBox, { LoadingShimmer } from "~/components/BalanceBox";
import NavBar from "~/components/NavBar";
import ReloadPrompt from "~/components/Reload";
import { A } from "solid-start";
import { OnboardWarning } from "~/components/OnboardWarning";
import { CombinedActivity } from "./Activity";
import { useMegaStore } from "~/state/megaStore";
import { Match, Show, Suspense, Switch } from "solid-js";
import { BetaWarningModal } from "~/components/BetaWarningModal";
import settings from "~/assets/icons/settings.svg";
import pixelLogo from "~/assets/mutiny-pixel-logo.png";
import plusLogo from "~/assets/mutiny-plus-logo.png";
import { PendingNwc } from "./PendingNwc";
import { DecryptDialog } from "./DecryptDialog";
import { LoadingIndicator } from "./LoadingIndicator";
import { FeedbackLink } from "~/routes/Feedback";
import { useI18n } from "~/i18n/context";

export default function App() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    return (
        <SafeArea>
            <DefaultMain>
                <LoadingIndicator />
                <header class="w-full flex justify-between items-center mt-4 mb-2">
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
                            <div class="box-border px-2 py-1 -my-1 text-white-400 bg-neutral-800 rounded text-xs uppercase  w-fit">
                                {state.mutiny_wallet?.get_network()}
                            </div>
                        </Show>
                    </div>
                    <A
                        class="md:hidden p-2 hover:bg-white/5 rounded-lg active:bg-m-blue"
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
                    <Show when={!state.wallet_loading}>
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
                <div class="self-center mt-4">
                    <FeedbackLink />
                </div>
            </DefaultMain>
            <DecryptDialog />
            <BetaWarningModal />
            <NavBar activeTab="home" />
        </SafeArea>
    );
}
