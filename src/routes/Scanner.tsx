import { Clipboard } from "@capacitor/clipboard";
import { Capacitor } from "@capacitor/core";
import { LnUrlParams } from "@mutinywallet/mutiny-wasm";
import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";

import { Button, Scanner as Reader, showToast } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify } from "~/utils";

export function Scanner() {
    const i18n = useI18n();
    const [state, actions] = useMegaStore();
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

    function handleLnUrl(
        lnUrl: string,
        success: (result: LnUrlParams) => void
    ) {
        state.mutiny_wallet
            ?.decode_lnurl(lnUrl)
            .then((lnurlParams) => {
                success(lnurlParams);
            })
            .catch((e) => showToast(eify(e)));
    }

    // When we have a nice result we can head over to the next screen
    createEffect(() => {
        if (scanResult()) {
            actions.handleIncomingString(
                scanResult()!,
                (error) => {
                    showToast(error);
                },
                (result) => {
                    if (result.lnurl && !result.is_lnurl_auth) {
                        const lnurl = result.lnurl;
                        handleLnUrl(result.lnurl, (lnurlParams) => {
                            actions.setScanResult(result);
                            actions.setLnUrlData({
                                lnurl: lnurl,
                                params: lnurlParams
                            });
                            if (lnurlParams.tag === "withdrawRequest") {
                                navigate("/receive");
                            } else {
                                navigate("/send");
                            }
                        });
                    } else {
                        actions.setScanResult(result);
                        navigate("/send");
                    }
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
