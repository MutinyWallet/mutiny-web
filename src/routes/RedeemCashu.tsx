import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";

import {
    AmountSats,
    Button,
    DefaultMain,
    Indicator,
    LargeHeader,
    MutinyWalletGuard,
    NavBar
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export type ReceiveFlavor = "unified" | "lightning" | "onchain";
type ReceiveState = "edit" | "show" | "paid";

export function RedeemCashu() {
    const [state, actions] = useMegaStore();
    const navigate = useNavigate();
    const i18n = useI18n();

    const [receiveState, setReceiveState] = createSignal<ReceiveState>("edit");

    // loading state for the continue button
    const [loading, setLoading] = createSignal(false);

    async function onSubmit(e: Event) {
        e.preventDefault();
        meltCashuToken();
    }

    async function meltCashuToken() {
        const res = await state.mutiny_wallet?.melt_cashu_token(
            String(state.scan_result?.cashu_token)
        );
    }

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <LargeHeader
                    action={
                        receiveState() === "show" && (
                            <Indicator>{i18n.t("receive.checking")}</Indicator>
                        )
                    }
                >
                    Redeem Cashu token
                </LargeHeader>
            </DefaultMain>
            <div class="flex-1 self-center">
                <p class="text-center text-white">
                    Do you wish to redeem this Cashu token for
                    <AmountSats amountSats={state.scan_result?.amount_sats} />
                </p>
                <Button intent="green" onClick={onSubmit} loading={loading()}>
                    Redeem
                </Button>
            </div>
            {/* {i18n.t("common.redeem")} */}
            <NavBar activeTab="receive" />
        </MutinyWalletGuard>
    );
}
