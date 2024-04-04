import { Copy, QrCode } from "lucide-solid";
import { createMemo, createSignal, Match, Show, Switch } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";

import { FancyCard, LabelCircle, SimpleDialog } from "~/components";
import { useI18n } from "~/i18n/context";
import { UserProfile } from "~/routes";
import { useCopy } from "~/utils";

export function LightningAddressShower(props: {
    lud16?: string;
    profile?: UserProfile;
}) {
    const i18n = useI18n();
    const [showQr, setShowQr] = createSignal(false);

    const [copy, copied] = useCopy({ copiedTimeout: 1000 });

    const lud16 = createMemo(() => {
        return props.lud16 || props.profile?.lud16 || "";
    });

    return (
        <FancyCard>
            <Switch>
                <Match when={lud16()}>
                    <p class="break-all text-center font-system-mono text-base ">
                        {lud16()}
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
                            onClick={() => copy(lud16())}
                        >
                            <Copy class="inline-block" />
                        </button>
                    </div>{" "}
                    <SimpleDialog
                        open={showQr()}
                        setOpen={(open) => {
                            setShowQr(open);
                        }}
                        title={i18n.t("profile.pay_me")}
                    >
                        <Show when={props.profile}>
                            <div class="flex flex-col gap-2">
                                <div class="flex w-full justify-center">
                                    <LabelCircle
                                        name={props.profile?.name}
                                        image_url={props.profile?.picture}
                                        contact
                                        label={false}
                                        size="large"
                                    />
                                </div>
                                <h2 class="text-center text-lg font-semibold">
                                    {props.profile?.name}
                                </h2>
                            </div>
                            <p class="break-all text-center font-system-mono text-base ">
                                {lud16()}
                            </p>
                        </Show>
                        <div class="w-[10rem] self-center rounded bg-white p-[1rem]">
                            <QRCodeSVG
                                value={"lightning:" + lud16() || ""}
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
