import logo from '~/assets/icons/mutiny-logo.svg';
import BalanceBox from "~/components/BalanceBox";
import SafeArea from "~/components/SafeArea";
import NavBar from "~/components/NavBar";
import Card from "~/components/Card";
import { ButtonLink } from "~/components/Button";
import PeerConnectModal from "./PeerConnectModal";

// TODO: use this reload prompt for real
// import ReloadPrompt from "./Reload";

export default function App() {
    return (
        <SafeArea>
            <main class='flex flex-col gap-4 py-8 px-4'>
                <header>
                    <img src={logo} class="App-logo" alt="logo" />
                </header>
                {/* <ReloadPrompt /> */}
                <BalanceBox />
                <Card title="Kitchen Sink">
                    <PeerConnectModal />
                    <ButtonLink target="_blank" rel="noopener noreferrer" href="https://faucet.mutinynet.com/?address=abc123">Tap the Faucet</ButtonLink>
                </Card>
                {/* safety div */}
                <div class="h-32" />
            </main>
            <NavBar activeTab="home" />
        </SafeArea>
    );
}
