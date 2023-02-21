import { useState } from "react";
import button from "@/styles/button";

const INPUT = "w-full mb-4 p-2 rounded-lg text-black"

const WAITLIST_ENDPOINT = "https://waitlist.mutiny-waitlist.workers.dev/waitlist";
// const WAITLIST_ENDPOINT = "http://localhost:8787/waitlist";

export default function WaitlistForm() {
    let [nostr, setNostr] = useState(true);
    let [error, setError] = useState<string | undefined>(undefined);
    let [loading, setLoading] = useState(false);

    // Form submission function that takes the form data and sends it to the backend
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(undefined);
        setLoading(true);
        const form = e.currentTarget;
        const data = new FormData(form);
        const value = Object.fromEntries(data.entries());
        console.log(value);

        let payload: null | { user_type: string, id: string, comment: string } = null;

        if (nostr) {
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
        };

        console.log(payload);

        try {
            if (!payload || !payload.id) {
                throw new Error("nope");
            }

            let res = await fetch(WAITLIST_ENDPOINT, {
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
                localStorage.setItem('waitlist_id', payload!.id);
                window.location.reload();
            }

        } catch (e) {
            if (nostr) {
                setError("Something went wrong. Are you sure that's a valid npub?");
            } else {
                setError("Something went wrong. Are you sure that's a valid email?");
            }
            return
        }


    }

    return (
        <main className='flex flex-col gap-4 py-8 px-4 max-w-xl mx-auto drop-shadow-blue-glow'>
            <h1 className='text-4xl font-bold'>Join Waitlist</h1>
            {/* HTML form with three inputs: nostr pubkey (text), email (text), and a textarea for comments */}
            <h2 className="text-xl">
                Sign up for our waitlist and we'll send a message when Mutiny Wallet is ready for you.
            </h2>
            <div className="p-8 rounded-xl bg-half-black">
                <div className="flex gap-4 mb-6">
                    <button className={button({ intent: nostr ? "active" : "inactive" })} onClick={() => setNostr(true)}><span className="drop-shadow-sm shadow-black">Nostr</span></button>
                    <button className={button({ intent: nostr ? "inactive" : "active" })} onClick={() => setNostr(false)}><span className="drop-shadow-sm shadow-black">Email</span></button>
                </div>
                {error &&
                    <div className="mb-6">
                        <p className="text-m-red">Error: {error}</p>
                    </div>
                }
                <form className="flex flex-col items-start gap-2" onSubmit={handleSubmit}>
                    {nostr &&
                        <>
                            <label className="font-semibold" htmlFor="pubkey">Nostr npub or NIP-05</label>
                            <input className={INPUT} type="text" id="pubkey" name="pubkey" placeholder="npub..." />
                        </>
                    }
                    {
                        !nostr &&
                        <>
                            <label className="font-semibold" htmlFor="email">Email</label>
                            <input className={INPUT} type="text" id="email" name="email" placeholder="email@mutinywallet.com" />
                        </>
                    }
                    <label className="font-semibold" htmlFor="comments">Comments</label>
                    <textarea className={INPUT} id="comments" name="comments" rows={4} placeholder="I want a lightning wallet that does..." />
                    {loading &&
                        <div role="status">
                            <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-m-red" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                            </svg>
                            <span className="sr-only">Loading...</span>
                        </div>}
                    {!loading &&
                        <button className={button({ intent: "red", layout: "pad" })}><span className="drop-shadow-sm shadow-black">Submit</span></button>
                    }
                </form>
            </div>
        </main>
    )
}