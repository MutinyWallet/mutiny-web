import { Show } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";

import { useI18n } from "~/i18n/context";
import { useCopy } from "~/utils";

export function CopyableQR(props: { value: string }) {
    const i18n = useI18n();
    const [copy, copied] = useCopy({ copiedTimeout: 1000 });
    return (
        <div
            id="qr"
            class="relative w-full rounded-xl bg-white"
            onClick={() => copy(props.value)}
        >
            <Show when={copied()}>
                <div class="absolute z-50 flex h-full w-full flex-col items-center justify-center rounded-xl bg-neutral-900/60 transition-all">
                    <p class="text-xl font-bold">{i18n.t("common.copied")}</p>
                </div>
            </Show>
            <QRCodeSVG
                value={props.value}
                class="h-full max-h-[400px] w-full p-8"
            />
        </div>
    );
}
