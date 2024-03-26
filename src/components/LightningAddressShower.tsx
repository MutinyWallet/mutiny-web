import { Copy, QrCode } from "lucide-solid";
import { createSignal, Match, Switch } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";

import { FancyCard, SimpleDialog } from "~/components";
import { useI18n } from "~/i18n/context";
import { useCopy } from "~/utils";

export function LightningAddressShower(props: { lud16: string }) {
    const i18n = useI18n();
    const [showQr, setShowQr] = createSignal(false);

    const [copy, copied] = useCopy({ copiedTimeout: 1000 });

    return (
        <FancyCard>
            <Switch>
                <Match when={props.lud16}>
                    <p class="break-all text-center font-system-mono text-base ">
                        {props.lud16}
                    </p>
                    <div class="flex w-full justify-center gap-8">
                        <button onClick={() => setShowQr(true)}>
                            <QrCode class="inline-block" />
                        </button>
                        <button
                            class="p-1"
                            classList={{
                                "bg-m-red rounded": copied()
                            }}
                            onClick={() => copy(props.lud16)}
                        >
                            <Copy class="inline-block" />
                        </button>
                    </div>{" "}
                    <SimpleDialog
                        open={showQr()}
                        setOpen={(open) => {
                            setShowQr(open);
                        }}
                        title={"Lightning Address"}
                    >
                        <div class="w-[10rem] self-center rounded bg-white p-[1rem]">
                            <QRCodeSVG
                                value={"lightning:" + props.lud16 || ""}
                                class="h-full max-h-[256px] w-full"
                            />
                        </div>
                    </SimpleDialog>
                </Match>
                <Match when={true}>
                    <p class="text-center text-base italic text-m-grey-350">
                        {i18n.t("profile.no_lightning_address")}
                    </p>
                </Match>
            </Switch>
        </FancyCard>
    );
}
