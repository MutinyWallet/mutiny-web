import { useState } from "react";
import button from "./components/button"

const INPUT = "w-full mb-4 p-2 rounded-lg text-black"
export default function Join() {
    let [nostr, setNostr] = useState(true);
    return (
        <div className="safe-top safe-left safe-right safe-bottom">
            <div className="disable-scrollbars max-h-screen h-full overflow-y-scroll mx-4">
                <main className='flex flex-col gap-4 py-8 max-w-xl mx-auto'>
                    <h1 className='text-4xl font-bold'>Join Waitlist</h1>
                    {/* HTML form with three inputs: nostr pubkey (text), email (text), and a textarea for comments */}

                    <div className="p-8 rounded-xl bg-half-black">
                        <div className="flex gap-4 mb-6">
                            <button className={button({ intent: nostr ? "active" : "inactive" })} onClick={() => setNostr(true)}><span className="drop-shadow-sm shadow-black">Nostr</span></button>
                            <button className={button({ intent: nostr ? "inactive" : "active" })} onClick={() => setNostr(false)}><span className="drop-shadow-sm shadow-black">Email</span></button>
                        </div>
                        <form className="flex flex-col items-start gap-2">
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
                            <button className={button({ intent: "red", layout: "pad" })}><span className="drop-shadow-sm shadow-black">Submit</span></button>
                        </form>
                    </div>
                </main>
            </div>
        </div >
    )
}