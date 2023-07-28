import { Match, Show, Switch } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";
import { ReceiveFlavor } from "~/routes/Receive";
import { useCopy } from "~/utils/useCopy";
import { AmountSats, AmountFiat } from "./Amount";
import { TruncateMiddle } from "./ShareCard";
import copyBlack from "~/assets/icons/copy-black.svg";
import shareBlack from "~/assets/icons/share-black.svg";
import chainBlack from "~/assets/icons/chain-black.svg";
import boltBlack from "~/assets/icons/bolt-black.svg";
import { useI18n } from "~/i18n/context";

function KindIndicator(props: { kind: ReceiveFlavor }) {
    const i18n = useI18n();
    return (
        <div class="text-black flex flex-col items-end">
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
    kind: ReceiveFlavor;
}) {
    const i18n = useI18n();
    const [copy, copied] = useCopy({ copiedTimeout: 1000 });
    return (
        <div
            id="qr"
            class="w-full bg-white rounded-xl relative flex flex-col items-center px-4"
            onClick={() => copy(props.value)}
        >
            <Show when={copied()}>
                <div class="absolute w-full h-full bg-neutral-900/60 z-50 rounded-xl flex flex-col items-center justify-center transition-all">
                    <p class="text-xl font-bold">{i18n.t("common.copied")}</p>
                </div>
            </Show>
            <div
                class="w-full flex items-center py-4 max-w-[256px]"
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
                        <div class="text-black text-sm">
                            <AmountFiat amountSats={Number(props.amountSats)} />
                        </div>
                    </div>
                </Show>
                <KindIndicator kind={props.kind} />
            </div>

            <QRCodeSVG
                value={props.value}
                class="w-full h-full max-h-[256px]"
            />
            <div
                class="w-full grid gap-1 py-4 max-w-[256px] "
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
