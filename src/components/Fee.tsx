import { AmountFiat, AmountSats, FeesModal } from "~/components";
import { useI18n } from "~/i18n/context";

export function Fee(props: { amountSats?: bigint | number }) {
    const i18n = useI18n();

    return (
        <div class="flex gap-3">
            <p class="text-sm text-m-grey-400">{i18n.t("common.fee")}</p>
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
                    <FeesModal />
                </div>
            </div>
        </div>
    );
}
