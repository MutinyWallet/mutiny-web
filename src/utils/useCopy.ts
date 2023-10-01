// Thanks you https://soorria.com/snippets/use-copy-solidjs
import { Clipboard } from "@capacitor/clipboard";
import { Capacitor } from "@capacitor/core";
import type { Accessor } from "solid-js";
import { createSignal } from "solid-js";

export type UseCopyProps = {
    copiedTimeout?: number;
};
type CopyFn = (text: string) => Promise<void>;
export const useCopy = ({ copiedTimeout = 2000 }: UseCopyProps = {}): [
    copy: CopyFn,
    copied: Accessor<boolean>
] => {
    const [copied, setCopied] = createSignal(false);
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const copy: CopyFn = async (text) => {
        if (Capacitor.isNativePlatform()) {
            await Clipboard.write({
                string: text
            });
        } else if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // handle if running on http://
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "absolute";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.select();
            await document.execCommand("copy");
            textArea.remove();
        }
        setCopied(true);
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => setCopied(false), copiedTimeout);
    };
    return [copy, copied];
};
