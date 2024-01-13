import { Copy, Eye, Share } from "lucide-solid";
import { createSignal, Show } from "solid-js";

import { Card, JsonModal, VStack } from "~/components";
import { useI18n } from "~/i18n/context";
import { useCopy } from "~/utils";

const STYLE =
    "px-4 py-2 rounded-xl border-2 border-white flex gap-2 items-center font-semibold hover:text-m-blue transition-colors";

function ShareButton(props: { receiveString: string; whiteBg?: boolean }) {
    const i18n = useI18n();
    async function share(receiveString: string) {
        // If the browser doesn't support share we can just copy the address
        if (!navigator.share) {
            console.error("Share not supported");
        }
        const shareData: ShareData = {
            title: i18n.t("common.title"),
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
            <span>{i18n.t("modals.share")}</span>
            <Share />
        </button>
    );
}

export function TruncateMiddle(props: { text: string; whiteBg?: boolean }) {
    return (
        <div
            class="flex font-mono"
            classList={{
                "text-black": props.whiteBg
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
    const i18n = useI18n();
    const [open, setOpen] = createSignal(false);
    return (
        <>
            <JsonModal
                open={open()}
                plaintext={props.text}
                title={i18n.t("modals.details")}
                setOpen={setOpen}
            />
            <div class="grid w-full grid-cols-[minmax(0,_1fr)_auto] items-center">
                <TruncateMiddle text={props.text} />
                <button class="w-[2rem]" onClick={() => setOpen(true)}>
                    <Eye />
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
    const i18n = useI18n();
    const [copy, copied] = useCopy({ copiedTimeout: 1000 });

    function handleCopy() {
        copy(props.text ?? "");
    }

    return (
        <button class={STYLE} onClick={handleCopy}>
            {copied()
                ? i18n.t("common.copied")
                : props.title ?? i18n.t("common.copy")}
            <Copy />
        </button>
    );
}

export function ShareCard(props: { text?: string }) {
    return (
        <Card>
            <StringShower text={props.text ?? ""} />
            <VStack>
                <div class="flex justify-center gap-4">
                    <CopyButton text={props.text ?? ""} />
                    <Show when={navigator.share}>
                        <ShareButton receiveString={props.text ?? ""} />
                    </Show>
                </div>
            </VStack>
        </Card>
    );
}
