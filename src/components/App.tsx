import { For } from "solid-js";
import { Motion, Presence } from "@motionone/solid";

import logo from '~/assets/icons/mutiny-logo.svg';
import send from '~/assets/icons/send.svg';
import BalanceBox from "~/components/BalanceBox";
import SafeArea from "~/components/SafeArea";
import NavBar from "~/components/NavBar";
import Card from "~/components/Card";
import { Button, ButtonLink } from "~/components/Button";
import Modal from "./Modal";
import PeerConnectModal from "./PeerConnectModal";

// TODO: use this reload prompt for real
// import ReloadPrompt from "./Reload";

function ActivityItem() {
    return (
        <div class="flex flex-row border-b border-gray-500 gap-4 py-2">
            <img src={send} class="App-logo" alt="logo" />
            <div class='flex flex-col flex-1'>
                <h1>Bitcoin Beefsteak</h1>
                <h2>-1,441,851 SAT</h2>
                <h3 class='text-sm text-gray-500'>Jul 24</h3>
            </div>
            <div class='text-sm font-semibold uppercase text-[#E23A5E]'>SEND</div>
        </div>
    )
}

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
