import logo from '~/assets/icons/mutiny-logo.svg';
import { SafeArea } from "~/components/layout";
import BalanceBox from "~/components/BalanceBox";
import NavBar from "~/components/NavBar";

// TODO: use this reload prompt for real
import ReloadPrompt from "~/components/Reload";
import KitchenSink from './KitchenSink';

export default function App() {
    return (
        <SafeArea>
            <main class='flex flex-col gap-4 py-8 px-4 max-w-[800px] mx-auto'>
                <header>
                    <img src={logo} class="App-logo" alt="logo" />
                </header>
                <BalanceBox />
                <ReloadPrompt />
                <KitchenSink />
                {/* safety div */}
                <div class="h-32" />
            </main>
            <NavBar activeTab="home" />
        </SafeArea>
    );
}
