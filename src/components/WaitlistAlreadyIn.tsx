import Notes from "./Notes";
import { NostrProvider } from "nostr-react";

const relayUrls = [
    "wss://nostr.zebedee.cloud",
    "wss://relay.snort.social",
    "wss://nos.lol",
    "wss://brb.io",
    "wss://nostr.fmt.wiz.biz",
    "wss://relay.damus.io",
]

export function WaitlistAlreadyIn() {
    return (
        <main className='flex flex-col gap-4 py-8 max-w-xl mx-auto items-center drop-shadow-blue-glow'>
            <h1 className="text-4xl font-bold">You're on a list!</h1>
            <h2 className="text-xl">
                We'll message you when Mutiny Wallet is ready.
            </h2>
            <div className="p-8 rounded-xl bg-half-black">
                <h2 className="text-sm font-semibold uppercase">Recent Updates</h2>
                <NostrProvider relayUrls={relayUrls} debug={true}>
                    <Notes />
                </NostrProvider>
            </div>
        </main>
    );
}
