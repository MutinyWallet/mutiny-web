import { Match, Switch, createSignal } from "solid-js"

export function SeedWords(props: { words: string }) {
    const [shouldShow, setShouldShow] = createSignal(false)

    function toggleShow() {
        setShouldShow(!shouldShow())
    }

    return (<pre class="flex items-center gap-4 bg-m-red p-4 rounded-xl overflow-hidden">
        <Switch>
            <Match when={!shouldShow()}>
                <div onClick={toggleShow} class="cursor-pointer">
                    <code class="text-red">TAP TO REVEAL SEED WORDS</code>
                </div>
            </Match>

            <Match when={shouldShow()}>
                <div onClick={toggleShow} class="cursor-pointer overflow-hidden">
                    <p class="font-mono w-full whitespace-pre-wrap">
                        {props.words}
                    </p>
                </div>
            </Match>
        </Switch>
    </pre >)
}