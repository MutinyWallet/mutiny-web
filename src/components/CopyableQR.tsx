import { Show } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";
import { useI18n } from "~/i18n/context";
import { useCopy } from "~/utils/useCopy";

export function CopyableQR(props: { value: string }) {
    const i18n = useI18n();
    const [copy, copied] = useCopy({ copiedTimeout: 1000 });
    return (
        <div
            id="qr"
            class="w-full bg-white rounded-xl relative"
            onClick={() => copy(props.value)}
        >
            <Show when={copied()}>
                <div class="absolute w-full h-full bg-neutral-900/60 z-50 rounded-xl flex flex-col items-center justify-center transition-all">
                    <p class="text-xl font-bold">{i18n.t("common.copied")}</p>
                </div>
            </Show>
            <QRCodeSVG
                value={props.value}
                class="w-full h-full p-8 max-h-[400px]"
            />
        </div>
    );
}
