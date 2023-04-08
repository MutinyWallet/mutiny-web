import { For } from "solid-js";
import { Motion, Presence } from "@motionone/solid";

import logo from '~/assets/icons/mutiny-logo.svg';
import send from '~/assets/icons/send.svg';
import BalanceBox from "./BalanceBox";
import SafeArea from "./SafeArea";
import NavBar from "./NavBar";

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
                <div class='rounded-xl p-4 flex flex-col gap-2 bg-[rgba(0,0,0,0.5)]'>
                    <header class='text-sm font-semibold uppercase'>
                        Activity
                    </header>
                    <For each={[1, 2, 3, 4]}>
                        {() =>
                            <Presence>
                                <Motion
                                    initial={{ opacity: 0, scaleY: 0 }}
                                    animate={{ opacity: 1, scaleY: 1 }}
                                    exit={{ opacity: 0, scaleY: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ActivityItem />
                                </Motion>
                            </Presence>
                        }
                    </For>
                    <div class='flex justify-end py-4'>
                        <a href="#" class='underline text-sm'>
                            MORE
                        </a>
                    </div>
                </div>
                {/* safety div */}
                <div class="h-32" />
            </main>
            <NavBar activeTab="home" />
        </SafeArea>
    );
}
