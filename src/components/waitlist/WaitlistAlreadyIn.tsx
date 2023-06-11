import { createResource, Show, onMount } from "solid-js";

const relayUrls = [
    "wss://nostr.zebedee.cloud",
    "wss://relay.snort.social",
    "wss://nos.lol",
    "wss://nostr.fmt.wiz.biz",
    "wss://relay.damus.io",
    "wss://eden.nostr.land"
];

import { SimplePool } from "nostr-tools";
import { LoadingSpinner } from "~/components/layout";
import Notes from "~/components/waitlist/Notes";
import logo from "~/assets/icons/mutiny-logo.svg";

const pool = new SimplePool();

const postsFetcher = async () => {
    const filter = {
        authors: [
            "df173277182f3155d37b330211ba1de4a81500c02d195e964f91be774ec96708"
        ],
        since: 0,
        kinds: [1]
    };

    const events = await pool.list(relayUrls, [filter]);

    return events;
};

export function WaitlistAlreadyIn() {
    const [posts] = createResource("", postsFetcher);

    // Allow invite parameter to bypass waitlist
    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const invite = urlParams.get('invite');
        if (invite === 'true') {
            localStorage.setItem('already_approved', 'true');
            window.location.href = "/";
        }
    });

    return (
        <main class="flex flex-col gap-4 sm:gap-4 py-8 px-4 max-w-xl mx-auto items-start drop-shadow-blue-glow">
            <a href="https://mutinywallet.com">
                <img src={logo} class="h-10" alt="logo" />
            </a>
            <h1 class="text-4xl font-bold">You're on a list!</h1>
            <h2 class="text-xl pr-4">
                We'll message you when Mutiny Wallet is ready.
            </h2>
            <div class="px-4 sm:px-8 py-8 rounded-xl bg-half-black w-full">
                <h2 class="text-sm font-semibold uppercase">Recent Updates</h2>
                <Show
                    when={!posts.loading}
                    fallback={
                        <div class="h-[10rem]">
                            <LoadingSpinner big wide />
                        </div>
                    }
                >
                    <Notes notes={(posts() && posts()) || []} />
                </Show>
            </div>
        </main>
    );
}
