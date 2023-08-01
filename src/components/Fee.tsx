import { useI18n } from "~/i18n/context";
import { AmountFiat, AmountSats } from "~/components/Amount";
import { FeesModal } from "~/components/MoreInfoModal";

export function Fee(props: { amountSats?: bigint | number }) {
    const i18n = useI18n();

    return (
        <div class="flex gap-3">
            <p class="text-m-grey-400 text-sm">{i18n.t("common.fee")}</p>
            <div class="flex gap-1">
                <div class="flex flex-col gap-1">
                    <div class="text-right text-sm">
                        <AmountSats
                            amountSats={props.amountSats}
                            denominationSize="sm"
                        />
                    </div>
                    <div class="text-xs text-white/70">
                        <AmountFiat amountSats={props.amountSats} />
                    </div>
                </div>
                <div>
                    <FeesModal icon />
                </div>
            </div>
        </div>
    );
}
