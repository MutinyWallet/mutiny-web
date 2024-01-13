import { Copy, Link, Share, Zap } from "lucide-solid";
import { Match, Show, Switch } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";

import { AmountFiat, AmountSats, TruncateMiddle } from "~/components";
import { useI18n } from "~/i18n/context";
import { ReceiveFlavor } from "~/routes/Receive";
import { useCopy } from "~/utils";

function KindIndicator(props: { kind: ReceiveFlavor | "gift" | "lnAddress" }) {
    const i18n = useI18n();
    return (
        <div class="flex flex-col items-end text-black">
            <Switch>
                <Match when={props.kind === "onchain"}>
                    <h3 class="font-semibold">
                        {i18n.t("receive.integrated_qr.onchain")}
                    </h3>
                    <Link class="h-4 w-4" />
                </Match>

                <Match when={props.kind === "lightning"}>
                    <h3 class="font-semibold">
                        {i18n.t("receive.integrated_qr.lightning")}
                    </h3>
                    <Zap class="h-4 w-4" />
                </Match>

                <Match when={props.kind === "lnAddress"}>
                    <h3 class="font-semibold">
                        {i18n.t("contacts.ln_address")}
                    </h3>
                    <Zap class="h-4 w-4" />
                </Match>

                <Match when={props.kind === "gift"}>
                    <h3 class="font-semibold">
                        {i18n.t("receive.integrated_qr.gift")}
                    </h3>
                    <Zap class="h-4 w-4" />
                </Match>

                <Match when={props.kind === "unified"}>
                    <h3 class="font-semibold">
                        {i18n.t("receive.integrated_qr.unified")}
                    </h3>
                    <div class="flex gap-1">
                        <Zap class="h-4 w-4" />
                        <Link class="h-4 w-4" />
                    </div>
                </Match>
            </Switch>
        </div>
    );
}

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

export function IntegratedQr(props: {
    value: string;
    kind: ReceiveFlavor | "gift" | "lnAddress";
    amountSats?: string;
}) {
    const i18n = useI18n();
    const [copy, copied] = useCopy({ copiedTimeout: 1000 });
    return (
        <div
            id="qr"
            class="relative flex w-full flex-col items-center rounded-xl bg-white px-4 text-black"
            onClick={() => copy(props.value)}
        >
            <Show when={copied()}>
                <div class="absolute z-50 flex h-full w-full flex-col items-center justify-center rounded-xl bg-neutral-900/60 text-white transition-all">
                    <p class="text-xl font-bold">{i18n.t("common.copied")}</p>
                </div>
            </Show>
            <Show when={props.kind !== "lnAddress"}>
                <div
                    class="flex w-full max-w-[256px] items-center py-4"
                    classList={{
                        "justify-between": props.kind !== "onchain",
                        "justify-end": props.kind === "onchain"
                    }}
                >
                    <Show when={props.kind !== "onchain"}>
                        <div class="flex flex-col gap-1">
                            <AmountSats amountSats={Number(props.amountSats)} />
                            <div class="text-sm ">
                                <AmountFiat
                                    amountSats={Number(props.amountSats)}
                                />
                            </div>
                        </div>
                    </Show>
                    <KindIndicator kind={props.kind} />
                </div>
            </Show>
            <Show when={props.kind === "lnAddress"}>
                <div class="py-4" />
            </Show>

            <QRCodeSVG
                value={props.value}
                class="h-full max-h-[256px] w-full"
            />
            <div
                class="grid w-full max-w-[256px] gap-1 py-4 "
                classList={{
                    "grid-cols-[2rem_minmax(0,1fr)_2rem]": !!navigator.share,
                    "grid-cols-[minmax(0,1fr)_2rem]": !navigator.share
                }}
            >
                <Show when={!!navigator.share}>
                    <button
                        class="justify-self-start"
                        onClick={(_) => share(props.value)}
                    >
                        <Share />
                    </button>
                </Show>
                <Show when={props.kind !== "lnAddress"}>
                    <div class="">
                        <TruncateMiddle text={props.value} whiteBg />
                    </div>
                    <button
                        class=" justify-self-end"
                        onClick={() => copy(props.value)}
                    >
                        <Copy />
                    </button>
                </Show>
            </div>
        </div>
    );
}
