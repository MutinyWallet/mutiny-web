import { Card, VStack } from "~/components/layout";
import { useCopy } from "~/utils/useCopy";
import copyIcon from "~/assets/icons/copy.svg";
import copyBlack from "~/assets/icons/copy-black.svg";
import shareIcon from "~/assets/icons/share.svg";
import shareBlack from "~/assets/icons/share-black.svg";
import eyeIcon from "~/assets/icons/eye.svg";
import { Show, createSignal } from "solid-js";
import { JsonModal } from "./JsonModal";

const STYLE =
    "px-4 py-2 rounded-xl border-2 border-white flex gap-2 items-center font-semibold hover:text-m-blue transition-colors";

export function ShareButton(props: {
    receiveString: string;
    whiteBg?: boolean;
}) {
    async function share(receiveString: string) {
        // If the browser doesn't support share we can just copy the address
        if (!navigator.share) {
            console.error("Share not supported");
        }
        const shareData: ShareData = {
            title: "Mutiny Wallet",
            text: receiveString
        };
        try {
            await navigator.share(shareData);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <button class={STYLE} onClick={(_) => share(props.receiveString)}>
            <span>Share</span>
            <img src={props.whiteBg ? shareBlack : shareIcon} alt="share" />
        </button>
    );
}

export function TruncateMiddle(props: { text: string; whiteBg?: boolean }) {
    return (
        <div
            class="flex font-mono"
            classList={{
                "text-black": props.whiteBg,
                "text-neutral-300": !props.whiteBg
            }}
        >
            <span class="truncate">{props.text}</span>
            <span class="pr-2">
                {props.text.length > 32 ? props.text.slice(-8) : ""}
            </span>
        </div>
    );
}

export function StringShower(props: { text: string }) {
    const [open, setOpen] = createSignal(false);
    return (
        <>
            <JsonModal
                open={open()}
                plaintext={props.text}
                title="Details"
                setOpen={setOpen}
            />
            <div class="w-full grid grid-cols-[minmax(0,_1fr)_auto]">
                <TruncateMiddle text={props.text} />
                <button class="w-[2rem]" onClick={() => setOpen(true)}>
                    <img src={eyeIcon} alt="eye" />
                </button>
            </div>
        </>
    );
}

export function CopyButton(props: {
    text?: string;
    title?: string;
    whiteBg?: boolean;
}) {
    const [copy, copied] = useCopy({ copiedTimeout: 1000 });

    function handleCopy() {
        copy(props.text ?? "");
    }

    return (
        <button class={STYLE} onClick={handleCopy}>
            {copied() ? "Copied" : props.title ?? "Copy"}
            <img src={props.whiteBg ? copyBlack : copyIcon} alt="copy" />
        </button>
    );
}

export function ShareCard(props: { text?: string }) {
    return (
        <Card>
            <StringShower text={props.text ?? ""} />
            <VStack>
                <div class="flex gap-4 justify-center">
                    <CopyButton text={props.text ?? ""} />
                    <Show when={navigator.share}>
                        <ShareButton receiveString={props.text ?? ""} />
                    </Show>
                </div>
            </VStack>
        </Card>
    );
}
