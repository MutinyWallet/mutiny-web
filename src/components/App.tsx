import logo from '~/assets/icons/mutiny-logo.svg';
import { DefaultMain, MutinyWalletGuard, SafeArea } from "~/components/layout";
import BalanceBox from "~/components/BalanceBox";
import NavBar from "~/components/NavBar";
import ReloadPrompt from "~/components/Reload";
import { A } from 'solid-start';
import { Activity } from './Activity';
import settings from '~/assets/icons/settings.svg';

export default function App() {
    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <header class="w-full flex justify-between items-center mt-4 mb-2">
                        <img src={logo} class="h-10" alt="logo" />
                        <A class="md:hidden p-2 hover:bg-white/5 rounded-lg active:bg-m-blue" href="/settings"><img src={settings} alt="Settings" /></A>
                    </header>
                    <ReloadPrompt />
                    <BalanceBox />
                    <Activity />
                </DefaultMain>
                <NavBar activeTab="home" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
