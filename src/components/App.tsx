import logo from '~/assets/icons/mutiny-logo.svg';
import { DefaultMain, MutinyWalletGuard, SafeArea, VStack, Card } from "~/components/layout";
import BalanceBox from "~/components/BalanceBox";
import NavBar from "~/components/NavBar";
import ReloadPrompt from "~/components/Reload";
import { A } from 'solid-start';
import { OnboardWarning } from '~/components/OnboardWarning';
import { CombinedActivity } from './Activity';
import userClock from '~/assets/icons/user-clock.svg';

export default function App() {
    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <header class="w-full flex justify-between items-center mt-4 mb-2">
                        <img src={logo} class="h-10" alt="logo" />
                        <A class="md:hidden p-2 hover:bg-white/5 rounded-lg active:bg-m-blue" href="/activity"><img src={userClock} alt="Activity" /></A>
                    </header>
                    <OnboardWarning />
                    <ReloadPrompt />
                    <BalanceBox />
                    <Card title="Activity">
                        <VStack>
                            <CombinedActivity limit={3} />
                            {/* <ButtonLink href="/activity">View All</ButtonLink> */}
                            <A href="/activity" class="text-m-red active:text-m-red/80 text-xl font-semibold no-underline self-center">View All</A>
                        </VStack>
                    </Card>
                </DefaultMain>
                <NavBar activeTab="home" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
