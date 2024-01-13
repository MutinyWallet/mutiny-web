import { createResource, Match, Switch } from "solid-js";

import { InfoBox } from "~/components/InfoBox";
import { FeesModal } from "~/components/MoreInfoModal";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function ReceiveWarnings(props: {
    amountSats: string | bigint;
    from_fedi_to_ln?: boolean;
}) {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const [inboundCapacity] = createResource(async () => {
        try {
            const channels = await state.mutiny_wallet?.list_channels();
            let inbound = 0;

            for (const channel of channels) {
                inbound += channel.size - (channel.balance + channel.reserve);
            }

            return inbound;
        } catch (e) {
            console.error(e);
            return 0;
        }
    });

    const warningText = () => {
        if (state.federations?.length !== 0 && props.from_fedi_to_ln !== true) {
            return undefined;
        }
        if ((state.balance?.lightning || 0n) === 0n) {
            return i18n.t("receive.amount_editable.receive_too_small", {
                amount: "100,000"
            });
        }

        const parsed = Number(props.amountSats);
        if (isNaN(parsed)) {
            return undefined;
        }

        if (parsed > (inboundCapacity() || 0)) {
            return i18n.t("receive.amount_editable.setup_fee_lightning");
        }

        return undefined;
    };

    const sillyAmountWarning = () => {
        const parsed = Number(props.amountSats);
        if (isNaN(parsed)) {
            return undefined;
        }

        if (parsed >= 2099999997690000) {
            // If over 21 million bitcoin, warn that too much
            return i18n.t("receive.amount_editable.more_than_21m");
        }
    };

    return (
        <Switch>
            <Match when={sillyAmountWarning()}>
                <InfoBox accent="red">{sillyAmountWarning()}</InfoBox>
            </Match>
            <Match when={warningText()}>
                <InfoBox accent="blue">
                    {warningText()} <FeesModal />
                </InfoBox>
            </Match>
        </Switch>
    );
}
