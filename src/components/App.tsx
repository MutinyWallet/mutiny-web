import logo from '~/assets/icons/mutiny-logo.svg';
import BalanceBox from "~/components/BalanceBox";
import SafeArea from "~/components/SafeArea";
import NavBar from "~/components/NavBar";

// TODO: use this reload prompt for real
import ReloadPrompt from "~/components/Reload";
import KitchenSink from './KitchenSink';

export default function App() {
    return (
        <SafeArea>
            <main class='flex flex-col gap-4 py-8 px-4'>
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
