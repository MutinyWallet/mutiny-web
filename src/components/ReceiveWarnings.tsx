import { createMemo, createResource, Match, Switch } from "solid-js";

import { InfoBox } from "~/components/InfoBox";
import { FeesModal } from "~/components/MoreInfoModal";
import { useI18n } from "~/i18n/context";
import { ReceiveFlavor } from "~/routes";
import { useMegaStore } from "~/state/megaStore";

export function ReceiveWarnings(props: {
    amountSats: bigint;
    from_fedi_to_ln?: boolean;
    flavor?: ReceiveFlavor;
}) {
    const i18n = useI18n();
    const [state, _actions, sw] = useMegaStore();

    const [inboundCapacity] = createResource(async () => {
        try {
            const channels = await sw.list_channels();
            if (!channels) return 0n;

            let inbound = 0n;

            // PAIN: mutiny-wasm types say these are bigints, but they're actually numbers
            for (const channel of channels) {
                inbound +=
                    BigInt(channel.size) -
                    BigInt(channel.balance + channel.reserve);
            }

            return inbound;
        } catch (e) {
            console.error(e);
            return 0n;
        }
    });

    const warningText = () => {
        if (state.federations?.length !== 0 && props.from_fedi_to_ln !== true) {
            return undefined;
        }
        if (props.flavor === "lightning") {
            if (
                (state.balance?.lightning || 0n) === 0n &&
                !state.settings?.lsps_connection_string
            ) {
                return i18n.t("receive.amount_editable.receive_too_small", {
                    amount: "100,000"
                });
            }

            if (props.amountSats > (inboundCapacity() || 0n)) {
                return i18n.t("receive.amount_editable.setup_fee_lightning");
            }
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

    const tooSmallWarning = () => {
        if (
            props.flavor === "onchain" &&
            props.amountSats > 0n &&
            props.amountSats < 546n
        ) {
            return i18n.t("receive.error_under_min_onchain");
        }
    };

    const onChainFedi = createMemo(() => {
        if (props.flavor === "onchain" && state.federations?.length) {
            return true;
        }
    });

    return (
        <Switch>
            <Match when={tooSmallWarning()}>
                <InfoBox accent="red">{tooSmallWarning()}</InfoBox>
            </Match>
            <Match when={sillyAmountWarning()}>
                <InfoBox accent="red">{sillyAmountWarning()}</InfoBox>
            </Match>
            <Match when={warningText()}>
                <InfoBox accent="blue">
                    {warningText()} <FeesModal />
                </InfoBox>
            </Match>
            <Match when={onChainFedi()}>
                <InfoBox accent="blue">
                    {i18n.t("receive.warning_on_chain_fedi")}
                </InfoBox>
            </Match>
        </Switch>
    );
}
