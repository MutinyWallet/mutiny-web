import { createSignal, For } from "solid-js";
import { A } from "solid-start";
import { Motion, Presence } from "@motionone/solid";

import logo from '~/assets/icons/mutiny-logo.svg';
import mutiny_m from '~/assets/icons/m.svg';
import scan from '~/assets/icons/scan.svg';
import settings from '~/assets/icons/settings.svg';
import send from '~/assets/icons/send.svg';

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
    const [_isOpen, setOpen] = createSignal(false);
    return (
        <div class="safe-top safe-left safe-right safe-bottom">
            <div class="disable-scrollbars max-h-screen h-full overflow-y-scroll">
                <main class='flex flex-col gap-4 py-8 px-4'>
                    <header>
                        <img src={logo} class="App-logo" alt="logo" />
                    </header>
                    {/* <ReloadPrompt /> */}
                    <Presence>
                        <Motion
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, easing: [0.87, 0, 0.13, 1] }}
                        >
                            <div class='border border-white rounded-xl border-b-4 p-4 flex flex-col gap-2'>
                                <header class='text-sm font-semibold uppercase'>
                                    Balance
                                </header>
                                <div>
                                    <h1 class='text-4xl font-light'>
                                        69,420 <span class='text-xl'>SAT</span>
                                    </h1>
                                </div>
                                <div class="flex gap-2 py-4">
                                    <button onClick={() => setOpen(true)} class='bg-[#1EA67F] p-4 flex-1 rounded-xl text-xl font-semibold '><span class="drop-shadow-sm shadow-black">Send</span></button>
                                    <button class='bg-[#3B6CCC] p-4 flex-1 rounded-xl text-xl font-semibold '><span class="drop-shadow-sm shadow-black">Receive</span></button>
                                </div>
                            </div>
                        </Motion>
                    </Presence>

                    <div class='rounded-xl p-4 flex flex-col gap-2 bg-[rgba(0,0,0,0.5)]'>
                        <header class='text-sm font-semibold uppercase'>
                            Activity
                        </header>
                        <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}>
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
                <nav class='bg-black fixed bottom-0 shadow-lg z-40 w-full safe-bottom'>
                    <ul class='h-16 flex justify-between px-16 items-center'>
                        <li class='h-full border-t-2 border-b-2 border-b-black flex flex-col justify-center'>
                            <img src={mutiny_m} alt="home" />
                        </li>
                        <li>
                            <A href="/scanner">
                                <img src={scan} alt="scan" />
                            </A>
                        </li>
                        <li>
                            <img src={settings} alt="settings" />
                        </li>
                    </ul>
                </nav>
            </div>
        </div >


    );
}
