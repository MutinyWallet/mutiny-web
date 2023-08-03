import { Match, Show, Switch } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";

import boltBlack from "~/assets/icons/bolt-black.svg";
import chainBlack from "~/assets/icons/chain-black.svg";
import copyBlack from "~/assets/icons/copy-black.svg";
import shareBlack from "~/assets/icons/share-black.svg";
import { AmountFiat, AmountSats, TruncateMiddle } from "~/components";
import { useI18n } from "~/i18n/context";
import { ReceiveFlavor } from "~/routes/Receive";
import { useCopy } from "~/utils";

function KindIndicator(props: { kind: ReceiveFlavor | "gift" }) {
    const i18n = useI18n();
    return (
        <div class="flex flex-col items-end text-black">
            <Switch>
                <Match when={props.kind === "onchain"}>
                    <h3 class="font-semibold">
                        {i18n.t("receive.integrated_qr.onchain")}
                    </h3>
                    <img src={chainBlack} alt="chain" />
                </Match>

                <Match when={props.kind === "lightning"}>
                    <h3 class="font-semibold">
                        {i18n.t("receive.integrated_qr.lightning")}
                    </h3>
                    <img src={boltBlack} alt="bolt" />
                </Match>

                <Match when={props.kind === "gift"}>
                    <h3 class="font-semibold">
                        {i18n.t("receive.integrated_qr.gift")}
                    </h3>
                    <img src={boltBlack} alt="bolt" />
                </Match>

                <Match when={props.kind === "unified"}>
                    <h3 class="font-semibold">
                        {i18n.t("receive.integrated_qr.unified")}
                    </h3>
                    <div class="flex gap-1">
                        <img src={chainBlack} alt="chain" />
                        <img src={boltBlack} alt="bolt" />
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
    amountSats: string;
    kind: ReceiveFlavor | "gift";
}) {
    const i18n = useI18n();
    const [copy, copied] = useCopy({ copiedTimeout: 1000 });
    return (
        <div
            id="qr"
            class="relative flex w-full flex-col items-center rounded-xl bg-white px-4"
            onClick={() => copy(props.value)}
        >
            <Show when={copied()}>
                <div class="absolute z-50 flex h-full w-full flex-col items-center justify-center rounded-xl bg-neutral-900/60 transition-all">
                    <p class="text-xl font-bold">{i18n.t("common.copied")}</p>
                </div>
            </Show>
            <div
                class="flex w-full max-w-[256px] items-center py-4"
                classList={{
                    "justify-between": props.kind !== "onchain",
                    "justify-end": props.kind === "onchain"
                }}
            >
                <Show when={props.kind !== "onchain"}>
                    <div class="flex flex-col gap-1">
                        <div class="text-black">
                            <AmountSats amountSats={Number(props.amountSats)} />
                        </div>
                        <div class="text-sm text-black">
                            <AmountFiat amountSats={Number(props.amountSats)} />
                        </div>
                    </div>
                </Show>
                <KindIndicator kind={props.kind} />
            </div>

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
                        <img src={shareBlack} alt="share" />
                    </button>
                </Show>
                <div class="">
                    <TruncateMiddle text={props.value} whiteBg />
                </div>
                <button
                    class=" justify-self-end"
                    onClick={() => copy(props.value)}
                >
                    <img src={copyBlack} alt="copy" />
                </button>
            </div>
        </div>
    );
}
