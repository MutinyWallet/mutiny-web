import { useNostrEvents } from "nostr-react";
import { nip19 } from 'nostr-tools'
import Linkify from 'react-linkify';

type NostrEvent = {
    "content": string, "created_at": number, id?: string
}

function Note({ e }: { e: NostrEvent }) {
    const date = new Date(e.created_at * 1000);

    const linkRoot = "https://snort.social/e/";

    let noteId;

    if (e.id) {
        noteId = nip19.noteEncode(e.id)
    }

    return (
        <div className="flex gap-4 border-b border-faint-white py-6 items-start">
            <img className="bg-black rounded-xl" src="../180.png" width={45} height={45} />
            <div className="flex flex-col gap-2 max-w-sm">
                {/* <p>{JSON.stringify(e, null, 2)}</p> */}
                <p className="break-words">
                    <Linkify>
                        {e.content ?? e.content}
                    </Linkify>
                </p>
                <a className="no-underline hover:underline hover:decoration-light-text" href={`${linkRoot}${noteId}`}>
                    <small className="text-light-text">{date.toLocaleString()}</small>
                </a>
            </div>
        </div>
    )
}

export default function Notes() {
    const { events } = useNostrEvents({
        filter: {
            authors: [
                "df173277182f3155d37b330211ba1de4a81500c02d195e964f91be774ec96708"
            ],
            since: 0,
            kinds: [1],
        },
    });

    return (
        <ul className="flex flex-col">
            {events.filter((event) => !event.tags.length).map((event) => (
                <li className="w-full" key={event.id}><Note e={event as NostrEvent} /></li>
            ))}
        </ul>
    )
}