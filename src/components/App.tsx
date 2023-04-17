import logo from '~/assets/icons/mutiny-logo.svg';
import { DefaultMain, NodeManagerGuard, SafeArea } from "~/components/layout";
import BalanceBox from "~/components/BalanceBox";
import NavBar from "~/components/NavBar";
import ReloadPrompt from "~/components/Reload";
import { Scan } from '~/assets/svg/Scan';
import { A } from 'solid-start';

export default function App() {
    return (
        <NodeManagerGuard>
            <SafeArea>
                <DefaultMain>
                    <header class="w-full flex justify-between items-center mt-4 mb-2">
                        <img src={logo} class="h-10" alt="logo" />
                        <A class="p-2 hover:bg-white/5 rounded-lg active:bg-m-blue" href="scanner"><Scan /></A>
                    </header>
                    <BalanceBox />
                    <ReloadPrompt />
                </DefaultMain>
                <NavBar activeTab="home" />
            </SafeArea>
        </NodeManagerGuard>
    );
}
