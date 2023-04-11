import { Component, For, createEffect, createSignal } from "solid-js";

import { Event, nip19 } from "nostr-tools"
import { Linkify } from "~/components/layout";

type NostrEvent = {
    "content": string, "created_at": number, id?: string
}

const Note: Component<{ e: NostrEvent }> = (props) => {
    const linkRoot = "https://snort.social/e/";

    const [noteId, setNoteId] = createSignal("");

    createEffect(() => {
        if (props.e.id) {
            setNoteId(nip19.noteEncode(props.e.id))
        }
    })


    return (
        <div class="flex gap-4 border-b border-faint-white py-6 items-start w-full">
            <img class="bg-black rounded-xl flex-0" src="../180.png" width={45} height={45} />
            <div class="flex flex-col gap-2 flex-1">
                <p class="break-words">
                    {/* {props.e.content} */}
                    <Linkify initialText={props.e.content} />
                </p>
                <a class="no-underline hover:underline hover:decoration-light-text" href={`${linkRoot}${noteId()}`}>
                    <small class="text-light-text">{(new Date(props.e.created_at * 1000)).toLocaleString()}</small>
                </a>
            </div>
        </div>
    )
}

function filterReplies(event: Event) {
    // If there's a "p" tag or an "e" tag we want to return false, otherwise true
    for (const tag of event.tags) {
        if (tag[0] === "p" || tag[0] === "e") {
            return false
        }
    }
    return true
}

const Notes: Component<{ notes: Event[] }> = (props) => {
    return (<ul class="flex flex-col">
        <For each={props.notes.filter(filterReplies).sort((a, b) => b.created_at - a.created_at)}>
            {(item) =>
                <li class="w-full"><Note e={item as NostrEvent} /></li>
            }
        </For>
    </ul>)

}

export default Notes