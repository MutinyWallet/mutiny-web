import { Card, VStack } from "~/components/layout";
import { useCopy } from "~/utils/useCopy";
import copyIcon from "~/assets/icons/copy.svg"
import shareIcon from "~/assets/icons/share.svg"
import eyeIcon from "~/assets/icons/eye.svg"
import { Show, createSignal } from "solid-js";
import { JsonModal } from "./JsonModal";

const STYLE = "px-4 py-2 rounded-xl border-2 border-white flex gap-2 items-center font-semibold"

function ShareButton(props: { receiveString: string }) {
    async function share(receiveString: string) {
        // If the browser doesn't support share we can just copy the address
        if (!navigator.share) {
            console.error("Share not supported")
        }
        const shareData: ShareData = {
            title: "Mutiny Wallet",
            text: receiveString,
        }
        try {
            await navigator.share(shareData)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <button class={STYLE} onClick={(_) => share(props.receiveString)}><span>Share</span><img src={shareIcon} alt="share" /></button>
    )
}

export function StringShower(props: { text: string }) {
    const [open, setOpen] = createSignal(false);
    return (
        <>
            <JsonModal open={open()} data={props.text} title="Details" setOpen={setOpen} />
            <div class="w-full grid grid-cols-[minmax(0,_1fr)_auto]">
                <pre class="truncate text-neutral-400">{props.text}</pre>
                <button class="w-[2rem]" onClick={() => setOpen(true)}>
                    <img src={eyeIcon} alt="eye" />
                </button>
            </div>
        </>
    )
}

export function ShareCard(props: { text?: string }) {
    const [copy, copied] = useCopy({ copiedTimeout: 1000 });

    function handleCopy() {
        copy(props.text ?? "")
    }

    return (
        <Card>
            <StringShower text={props.text ?? ""} />
            <VStack>

                <div class="flex gap-4 justify-center">
                    <button class={STYLE} onClick={handleCopy}>{copied() ? "Copied" : "Copy"}<img src={copyIcon} alt="copy" /></button>
                    <Show when={navigator.share}>
                        <ShareButton receiveString={props.text ?? ""} />
                    </Show>
                </div>
            </VStack>
        </Card >
    )

}