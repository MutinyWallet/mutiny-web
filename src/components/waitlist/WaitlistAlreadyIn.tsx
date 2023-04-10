import { createResource, Show } from "solid-js";

const relayUrls = [
    "wss://nostr.zebedee.cloud",
    "wss://relay.snort.social",
    "wss://nos.lol",
    "wss://nostr.fmt.wiz.biz",
    "wss://relay.damus.io",
    "wss://eden.nostr.land"
]

import { SimplePool } from 'nostr-tools'
import { LoadingSpinner } from "~/components/layout";
import Notes from "~/components/waitlist/Notes";

const pool = new SimplePool()

const postsFetcher = async () => {

    const filter = {
        authors: [
            "df173277182f3155d37b330211ba1de4a81500c02d195e964f91be774ec96708"
        ],
        since: 0,
        kinds: [1]
    };

    const events = await pool.list(relayUrls, [filter])

    return events;
}

export function WaitlistAlreadyIn() {
    const [posts] = createResource("", postsFetcher);

    return (
        <main class='flex flex-col gap-2 sm:gap-4 py-8 px-4 max-w-xl mx-auto items-center drop-shadow-blue-glow'>
            <h1 class="text-4xl font-bold">You're on a list!</h1>
            <h2 class="text-xl">
                We'll message you when Mutiny Wallet is ready.
            </h2>
            <div class="px-4 sm:px-8 py-8 rounded-xl bg-half-black">
                <h2 class="text-sm font-semibold uppercase">Recent Updates</h2>
                <Show when={!posts.loading} fallback={<div class="h-[10rem]"><LoadingSpinner /></div>}>
                    <Notes notes={posts() && posts() || []} />
                </Show>
            </div>
        </main>
    );
}
