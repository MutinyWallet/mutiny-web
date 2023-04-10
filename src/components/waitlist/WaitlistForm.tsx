import { createSignal } from "solid-js";
import { Button, LoadingSpinner } from "~/components/layout";

const INPUT = "w-full mb-4 p-2 rounded-lg text-black"

const WAITLIST_ENDPOINT = "https://waitlist.mutiny-waitlist.workers.dev/waitlist";

export default function WaitlistForm() {
    const [nostr, setNostr] = createSignal(true);
    const [error, setError] = createSignal<string | undefined>(undefined);
    const [loading, setLoading] = createSignal(false);

    // Form submission function that takes the form data and sends it to the backend
    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError(undefined);
        setLoading(true);
        const form = e.currentTarget;
        const data = new FormData(form as HTMLFormElement);
        const value = Object.fromEntries(data.entries());
        console.log(value);

        let payload: null | { user_type: string, id: string, comment: string } = null;

        if (nostr()) {
            payload = {
                user_type: "nostr",
                id: value.pubkey as string,
                comment: value.comments as string
            }
        } else {
            payload = {
                user_type: "email",
                id: value.email as string,
                comment: value.comments as string
            }
        }

        console.log(payload);

        try {
            if (!payload || !payload.id) {
                throw new Error("nope");
            }

            const res = await fetch(WAITLIST_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (res.status !== 200) {
                throw new Error("nope");
            } else {
                // On success set the id in local storage and reload the page
                localStorage.setItem('waitlist_id', payload.id);
                window.location.reload();
            }

        } catch (e) {
            if (nostr()) {
                setError("Something went wrong. Are you sure that's a valid npub?");
            } else {
                setError("Something went wrong. Are you sure that's a valid email?");
            }
            setTimeout(() => setLoading(false), 1000);
            return
        }
    }

    return (
        <main class='flex flex-col gap-4 py-8 px-4 max-w-xl mx-auto drop-shadow-blue-glow'>
            <h1 class='text-4xl font-bold'>Join Waitlist</h1>
            {/* HTML form with three inputs: nostr pubkey (text), email (text), and a textarea for comments */}
            <h2 class="text-xl">
                Sign up for our waitlist and we'll send a message when Mutiny Wallet is ready for you.
            </h2>
            <div class="p-8 rounded-xl bg-half-black">
                <div class="flex gap-4 mb-6">
                    <Button intent={nostr() ? "active" : "inactive"} onClick={() => setNostr(true)}>Nostr</Button>
                    <Button intent={nostr() ? "inactive" : "active"} onClick={() => setNostr(false)}> Email</Button>
                </div>
                {error() &&
                    <div class="mb-6">
                        <p class="text-m-red">Error: {error()}</p>
                    </div>
                }
                <form class="flex flex-col items-start gap-2" onSubmit={handleSubmit}>
                    {nostr() &&
                        <>
                            <label class="font-semibold" for="pubkey">Nostr npub or NIP-05</label>
                            <input class={INPUT} type="text" id="pubkey" name="pubkey" placeholder="npub..." />
                        </>
                    }
                    {
                        !nostr() &&
                        <>
                            <label class="font-semibold" for="email">Email</label>
                            <input class={INPUT} type="text" id="email" name="email" placeholder="email@mutinywallet.com" />
                        </>
                    }
                    <label class="font-semibold" for="comments">Comments</label>
                    <textarea class={INPUT} id="comments" name="comments" rows={4} placeholder="I want a lightning wallet that does..." />
                    {loading() &&
                        <LoadingSpinner />
                    }
                    {!loading() &&
                        <Button intent="red" layout="pad" >Submit</Button>
                    }
                </form>
            </div>
        </main>
    )
}