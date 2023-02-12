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

    // Use a regex to read through the content and turn the links into <a> tags
    // const content = e.content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')

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
            {/* <div className="text-m-red text-sm uppercase font-semibold">Note</div> */}
        </div>
    )
}

export default function Notes() {
    const { events } = useNostrEvents({
        filter: {
            authors: [
                "0d6c8388dcb049b8dd4fc8d3d8c3bb93de3da90ba828e4f09c8ad0f346488a33",
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
            {/* <li><Note /></li>
            <li><Note /></li>
            <li><Note /></li>
            <li><Note /></li>
            <li><Note /></li> */}
        </ul>
    )
}