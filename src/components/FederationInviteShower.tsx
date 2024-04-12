import { Copy, QrCode } from "lucide-solid";
import { createSignal, Show } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";

import { SimpleDialog } from "~/components";
import { useI18n } from "~/i18n/context";
import { useCopy } from "~/utils";

export function FederationInviteShower(props: {
    name?: string;
    inviteCode: string;
}) {
    const i18n = useI18n();
    const [showQr, setShowQr] = createSignal(false);

    const [copy, copied] = useCopy({ copiedTimeout: 1000 });

    return (
        <>
            <div class="flex w-full justify-center gap-8">
                <button onClick={() => setShowQr(true)}>
                    <QrCode class="inline-block h-4 w-4" />
                </button>
                <button
                    class="p-1"
                    classList={{
                        "bg-m-red rounded": copied()
                    }}
                    onClick={() => copy(props.inviteCode)}
                >
                    <Copy class="inline-block h-4 w-4" />
                </button>
            </div>{" "}
            <SimpleDialog
                open={showQr()}
                setOpen={(open) => {
                    setShowQr(open);
                }}
                title={i18n.t("settings.manage_federations.join_me")}
            >
                <Show when={props.name}>
                    <p class="break-all text-center font-system-mono text-base ">
                        {props.name}
                    </p>
                </Show>
                <div class="w-[15rem] self-center rounded bg-white p-[1rem]">
                    <QRCodeSVG
                        value={props.inviteCode || ""}
                        class="h-full max-h-[500px] w-full"
                    />
                </div>
            </SimpleDialog>
        </>
    );
}
