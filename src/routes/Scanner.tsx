import { Clipboard } from "@capacitor/clipboard";
import { Capacitor } from "@capacitor/core";
import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";

import { Button, Scanner as Reader, showToast } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function Scanner() {
    const i18n = useI18n();
    const [_state, actions] = useMegaStore();
    const [scanResult, setScanResult] = createSignal<string>();
    const navigate = useNavigate();

    function onResult(result: string) {
        setScanResult(result);
    }

    // TODO: is this correct? we always go back to where we came from when we scan... kind of like scan is a modal tbh
    function exit() {
        history.back();
    }

    async function handlePaste() {
        try {
            let text;

            if (Capacitor.isNativePlatform()) {
                const { value } = await Clipboard.read();
                text = value;
            } else {
                text = await navigator.clipboard.readText();
            }

            const trimText = text.trim();
            setScanResult(trimText);
        } catch (e) {
            console.error(e);
        }
    }

    // When we have a nice result we can head over to the send screen
    createEffect(() => {
        if (scanResult()) {
            actions.handleIncomingString(
                scanResult()!,
                (error) => {
                    showToast(error);
                },
                (result) => {
                    actions.setScanResult(result);
                    navigate("/send");
                }
            );
        }
    });

    return (
        <div class="h-full safe-top safe-left safe-right safe-bottom">
            <Reader onResult={onResult} />
            <div class="fixed bottom-[2rem] flex w-full flex-col items-center gap-8 px-8">
                <div class="flex w-full max-w-[800px] flex-col gap-2">
                    <Button intent="blue" onClick={handlePaste}>
                        {i18n.t("scanner.paste")}
                    </Button>
                    <Button onClick={exit}>{i18n.t("scanner.cancel")}</Button>
                </div>
            </div>
        </div>
    );
}
