import Notes from "./Notes";
import { NostrProvider } from "nostr-react";
import { useState } from "react";

const relayUrls = [
    "wss://nostr.zebedee.cloud",
    "wss://relay.snort.social",
    "wss://nos.lol",
    "wss://brb.io",
    "wss://nostr.fmt.wiz.biz",
    "wss://relay.damus.io",
    "wss://eden.nostr.land"
]

export function WaitlistAlreadyIn() {
    const [skipCount, setSkipCount] = useState(0);

    function skipCounter() {
        setSkipCount(skipCount + 1);
        if (skipCount >= 6) {
            window.location.href = "/secretwaitlistskipper";
        }
    }

    return (
        <main className='flex flex-col gap-2 sm:gap-4 py-8 px-4 max-w-xl mx-auto items-center drop-shadow-blue-glow'>
            <h1 className="text-4xl font-bold">You're on a list!</h1>
            <h2 className="text-xl">
                We'll message you when Mutiny Wallet is ready.
            </h2>
            <div className="px-4 sm:px-8 py-8 rounded-xl bg-half-black">
                <h2 className="text-sm font-semibold uppercase">Recent Updates</h2>
                <NostrProvider relayUrls={relayUrls} debug={true}>
                    <Notes />
                </NostrProvider>
            </div>
            <button className="opacity-0" onClick={skipCounter}>Skip</button>
        </main>
    );
}
