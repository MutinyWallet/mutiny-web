import { createForm, required } from "@modular-forms/solid";
import { FedimintSweepResult } from "@mutinywallet/mutiny-wasm";
import { useNavigate } from "@solidjs/router";
import {
    createMemo,
    createResource,
    createSignal,
    For,
    Match,
    Show,
    Switch
} from "solid-js";

import {
    ActivityDetailsModal,
    AmountEditable,
    AmountFiat,
    BackLink,
    Button,
    Card,
    DefaultMain,
    Failure,
    Fee,
    FeeDisplay,
    InfoBox,
    LargeHeader,
    MegaCheck,
    MegaEx,
    MutinyWalletGuard,
    NavBar,
    ReceiveWarnings,
    showToast,
    SuccessModal,
    TextField,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { Network } from "~/logic/mutinyWalletSetup";
import { useMegaStore } from "~/state/megaStore";
import { eify, vibrateSuccess } from "~/utils";

type SweepResultDetails = {
    result?: FedimintSweepResult;
    failure_reason?: string;
};

export function SwapLightning() {
    const [state, _actions] = useMegaStore();
    const navigate = useNavigate();
    const i18n = useI18n();

    const [amountSats, setAmountSats] = createSignal(0n);
    const [feeSats, setFeeSats] = createSignal(0n);
    const [maxFederationBalanceBeforeSwap, setMaxFederationBalanceBeforeSwap] =
        createSignal(0n);
    const [previewFee, setPreviewFee] = createSignal(false);

    const [loading, setLoading] = createSignal(false);

    const [sweepResult, setSweepResult] = createSignal<SweepResultDetails>();

    function resetState() {
        setAmountSats(0n);
        setFeeSats(0n);
        setPreviewFee(false);
        setMaxFederationBalanceBeforeSwap(0n);
        setLoading(false);
        setSweepResult(undefined);
    }

    const handleSwap = async () => {
        if (canSwap()) {
            try {
                setLoading(true);

                if (isMax()) {
                    const result =
                        await state.mutiny_wallet?.sweep_federation_balance(
                            undefined
                        );

                    setSweepResult({ result: result });
                } else {
                    const result =
                        await state.mutiny_wallet?.sweep_federation_balance(
                            amountSats()
                        );

                    setSweepResult({ result: result });
                }

                await vibrateSuccess();
            } catch (e) {
                const error = eify(e);
                setSweepResult({ failure_reason: error.message });
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
    };

    const canSwap = () => {
        const balance = state.balance?.federation || 0n;
        const network = state.mutiny_wallet?.get_network() as Network;

        return amountSats() <= balance;
    };

    const amountWarning = () => {
        if (amountSats() === 0n || !!sweepResult() || loading()) {
            return undefined;
        }

        if (amountSats() > (state.balance?.federation || 0n)) {
            return i18n.t("swap_lightning.insufficient_funds");
        }

        return undefined;
    };

    function calculateMaxFederation() {
        return state.balance?.federation ?? 0n;
    }

    const maxFederationBalance = createMemo(() => {
        return calculateMaxFederation();
    });

    const isMax = createMemo(() => {
        return amountSats() === calculateMaxFederation();
    });

    const feeIsSet = createMemo(() => {
        return feeSats() !== 0n;
    });

    const feeEstimate = async () => {
        if (canSwap()) {
            try {
                setLoading(true);
                if (isMax()) {
                    const fee =
                        await state.mutiny_wallet?.estimate_sweep_federation_fee(
                            undefined
                        );
                    setFeeSats(fee);
                    setMaxFederationBalanceBeforeSwap(calculateMaxFederation());
                    setPreviewFee(true);
                } else {
                    const fee =
                        await state.mutiny_wallet?.estimate_sweep_federation_fee(
                            amountSats()
                        );
                    setFeeSats(fee);
                    setMaxFederationBalanceBeforeSwap(calculateMaxFederation());
                    setPreviewFee(true);
                }
            } catch (e) {
                console.error(e);
                return undefined;
            } finally {
                setLoading(false);
            }
        }

        return undefined;
    };

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <BackLink />
                <LargeHeader>{i18n.t("swap_lightning.header")}</LargeHeader>
                <SuccessModal
                    confirmText={
                        sweepResult()?.result
                            ? i18n.t("common.nice")
                            : i18n.t("common.home")
                    }
                    open={!!sweepResult()}
                    setOpen={(open: boolean) => {
                        if (!open) resetState();
                    }}
                    onConfirm={() => {
                        resetState();
                        navigate("/");
                    }}
                >
                    <Switch>
                        <Match when={sweepResult()?.failure_reason}>
                            <Failure reason={sweepResult()?.failure_reason} />
                        </Match>
                        <Match when={sweepResult()?.result}>
                            <MegaCheck />
                            <div class="flex flex-col justify-center">
                                <h1 class="mb-2 mt-4 w-full justify-center text-center text-2xl font-semibold md:text-3xl">
                                    {i18n.t("swap_lightning.completed")}
                                </h1>
                                <p class="text-center text-xl">
                                    {i18n.t("swap_lightning.sats_added", {
                                        amount: Number(
                                            sweepResult()?.result?.amount
                                        ).toLocaleString()
                                    })}
                                </p>
                                <div class="text-center text-sm text-white/70">
                                    <AmountFiat
                                        amountSats={Number(
                                            sweepResult()?.result?.amount
                                        )}
                                    />
                                </div>
                            </div>
                            <hr class="w-16 bg-m-grey-400" />
                            <Fee
                                amountSats={Number(sweepResult()?.result?.fees)}
                            />
                        </Match>
                    </Switch>
                </SuccessModal>
                <div class="flex flex-1 flex-col justify-between gap-2">
                    <div class="flex-1" />
                    <VStack biggap>
                        <AmountEditable
                            initialAmountSats={amountSats()}
                            setAmountSats={setAmountSats}
                            activeMethod={{
                                method: "lightning",
                                maxAmountSats: maxFederationBalance()
                            }}
                            methods={[
                                {
                                    method: "lightning",
                                    maxAmountSats: maxFederationBalance()
                                }
                            ]}
                        />
                        <Show when={feeIsSet()}>
                            <FeeDisplay
                                amountSats={amountSats().toString()}
                                fee={feeSats()!.toString()}
                                maxAmountSats={maxFederationBalanceBeforeSwap()!.toString()}
                            />
                        </Show>
                        <ReceiveWarnings
                            amountSats={amountSats() || "0"}
                            from_fedi_to_ln={true}
                        />
                        <Show when={amountWarning() && amountSats() > 0n}>
                            <InfoBox accent={"red"}>{amountWarning()}</InfoBox>
                        </Show>
                    </VStack>
                    <div class="flex-1" />
                    <VStack>
                        <Button
                            disabled={!canSwap()}
                            intent="blue"
                            onClick={() => {
                                if (!previewFee()) {
                                    feeEstimate();
                                } else {
                                    handleSwap();
                                }
                            }}
                            loading={loading()}
                        >
                            {!previewFee()
                                ? i18n.t("swap_lightning.preview_swap")
                                : i18n.t("swap_lightning.confirm_swap")}
                        </Button>
                    </VStack>
                </div>
            </DefaultMain>
            <NavBar activeTab="none" />
        </MutinyWalletGuard>
    );
}
