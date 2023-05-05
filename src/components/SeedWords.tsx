import { For, Match, Switch, createMemo, createSignal } from "solid-js"

export function SeedWords(props: { words: string, setHasSeen?: (hasSeen: boolean) => void }) {
    const [shouldShow, setShouldShow] = createSignal(false)

    function toggleShow() {
        setShouldShow(!shouldShow())
        if (shouldShow()) {
            props.setHasSeen?.(true)
        }
    }

    const splitWords = createMemo(() => props.words.split(" "))

    return (<button class="flex items-center gap-4 bg-m-red p-4 rounded-xl overflow-hidden" onClick={toggleShow}>
        <Switch>
            <Match when={!shouldShow()}>
                <div class="cursor-pointer">
                    <code class="text-red">TAP TO REVEAL SEED WORDS</code>
                </div>
            </Match>

            <Match when={shouldShow()}>
                <ol class="cursor-pointer overflow-hidden grid grid-cols-2 w-full list-decimal list-inside">
                    <For each={splitWords()}>
                        {(word) => (
                            <li class="font-mono text-left">
                                {word}
                            </li>
                        )}
                    </For>
                </ol>
            </Match>
        </Switch>
    </button >)
}