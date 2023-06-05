import logo from '~/assets/icons/mutiny-logo.svg';
import { DefaultMain, SafeArea, VStack, Card } from "~/components/layout";
import BalanceBox, { LoadingShimmer } from "~/components/BalanceBox";
import NavBar from "~/components/NavBar";
import ReloadPrompt from "~/components/Reload";
import { A } from 'solid-start';
import { OnboardWarning } from '~/components/OnboardWarning';
import { CombinedActivity } from './Activity';
import userClock from '~/assets/icons/user-clock.svg';
import { useMegaStore } from '~/state/megaStore';
import { Show } from 'solid-js';
import { ExternalLink } from "./layout/ExternalLink";

export default function App() {
    const [state, _actions] = useMegaStore();

    return (
      <SafeArea>
        <DefaultMain>
          <header class="w-full flex justify-between items-center mt-4 mb-2">
            <img src={logo} class="h-10" alt="logo" />
            <A class="md:hidden p-2 hover:bg-white/5 rounded-lg active:bg-m-blue" href="/activity">
              <img src={userClock} alt="Activity" class="h-8 w-8" />
            </A>
          </header>
          <Show when={!state.wallet_loading}>
            <OnboardWarning />
            <ReloadPrompt />
          </Show>
          <BalanceBox loading={state.wallet_loading} />
          <Card title="Activity">
            <div class="p-1" />
            <VStack>
              <Show when={!state.wallet_loading} fallback={<LoadingShimmer />}>
                <CombinedActivity limit={3} />
              </Show>
              {/* <ButtonLink href="/activity">View All</ButtonLink> */}
            </VStack>
            <Show when={state.activity && state.activity.length > 0}>
              <A
                href="/activity"
                class="text-m-red active:text-m-red/80 text-xl font-semibold no-underline self-center"
              >
                View All
              </A>
            </Show>
          </Card>
          <p class="self-center text-neutral-500 mt-4">
            Bugs? Feedback?{" "}
            <span class="text-neutral-400">
              <ExternalLink href="https://github.com/MutinyWallet/mutiny-web/issues">
                Create an issue
              </ExternalLink>
            </span>
          </p>
        </DefaultMain>
        <NavBar activeTab="home" />
      </SafeArea>
    );
}
