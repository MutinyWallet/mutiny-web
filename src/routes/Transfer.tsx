import { FedimintSweepResult } from "@mutinywallet/mutiny-wasm";
import { createAsync, useNavigate, useSearchParams } from "@solidjs/router";
import { ArrowDown, Users } from "lucide-solid";
import { createMemo, createSignal, Match, Suspense, Switch } from "solid-js";

import {
    AmountEditable,
    AmountFiat,
    AmountSats,
    BackLink,
    Button,
    DefaultMain,
    Failure,
    Fee,
    LargeHeader,
    MegaCheck,
    MutinyWalletGuard,
    SharpButton,
    SuccessModal,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify, vibrateSuccess } from "~/utils";

type TransferResultDetails = {
    result?: FedimintSweepResult;
    failure_reason?: string;
};

export function Transfer() {
    const [state, _actions, sw] = useMegaStore();
    const i18n = useI18n();
    const navigate = useNavigate();
    const [amountSats, setAmountSats] = createSignal(0n);
    const [loading, setLoading] = createSignal(false);
    const [params] = useSearchParams();

    const [transferResult, setTransferResult] =
        createSignal<TransferResultDetails>();

    const fromFed = () => {
        return state.federations?.find((f) => f.federation_id === params.from);
    };

    const toFed = () => {
        return state.federations?.find((f) => f.federation_id !== params.from);
    };

    const federationBalances = createAsync(async () => {
        try {
            const balances = await sw.get_federation_balances();
            return balances?.balances || [];
        } catch (e) {
            console.error(e);
            return [];
        }
    });

    const calculateMaxFederation = createAsync(async () => {
        const balance = federationBalances()?.find(
            (f) => f.identity_federation_id === fromFed()?.federation_id
        )?.balance;
        return balance || 0n;
    });

    const toBalance = createAsync(async () => {
        return federationBalances()?.find(
            (f) => f.identity_federation_id === toFed()?.federation_id
        )?.balance;
    });

    const isMax = createMemo(() => {
        return amountSats() === calculateMaxFederation();
    });

    const canTransfer = createMemo(() => {
        if (!calculateMaxFederation()) return false;
        return amountSats() > 0n && amountSats() <= calculateMaxFederation()!;
    });

    async function handleTransfer() {
        try {
            setLoading(true);
            if (!fromFed()) throw new Error("No from federation");
            if (!toFed()) throw new Error("No to federation");

            if (isMax()) {
                const result = await sw.sweep_federation_balance(
                    undefined,
                    fromFed()?.federation_id,
                    toFed()?.federation_id
                );

                setTransferResult({ result: result });
            } else {
                const result = await sw.sweep_federation_balance(
                    amountSats(),
                    fromFed()?.federation_id,
                    toFed()?.federation_id
                );

                setTransferResult({ result: result });
            }

            await vibrateSuccess();
        } catch (e) {
            const error = eify(e);
            setTransferResult({ failure_reason: error.message });
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <SuccessModal
                    confirmText={
                        transferResult()?.result
                            ? i18n.t("common.nice")
                            : i18n.t("common.home")
                    }
                    open={!!transferResult()}
                    setOpen={(open: boolean) => {
                        if (!open) setTransferResult(undefined);
                    }}
                    onConfirm={() => {
                        setTransferResult(undefined);
                        navigate("/");
                    }}
                >
                    <Switch>
                        <Match when={transferResult()?.failure_reason}>
                            <Failure
                                reason={transferResult()!.failure_reason!}
                            />
                        </Match>
                        <Match when={transferResult()?.result}>
                            <MegaCheck />
                            <div class="flex flex-col justify-center">
                                <h1 class="mb-2 mt-4 w-full justify-center text-center text-2xl font-semibold md:text-3xl">
                                    {i18n.t("transfer.completed")}
                                </h1>
                                <p class="text-center text-xl">
                                    {i18n.t("transfer.sats_moved", {
                                        amount: Number(
                                            transferResult()?.result?.amount
                                        ).toLocaleString(),
                                        federation_name:
                                            toFed()?.federation_name
                                    })}
                                </p>
                                <div class="text-center text-sm text-white/70">
                                    <Suspense>
                                        <AmountFiat
                                            amountSats={Number(
                                                transferResult()?.result?.amount
                                            )}
                                        />
                                    </Suspense>
                                </div>
                            </div>
                            <hr class="w-16 bg-m-grey-400" />
                            <Fee
                                amountSats={Number(
                                    transferResult()?.result?.fees
                                )}
                            />
                        </Match>
                    </Switch>
                </SuccessModal>
                <BackLink
                    title={i18n.t("common.back")}
                    href="/settings/federations"
                    showOnDesktop
                />
                <LargeHeader>{i18n.t("transfer.title")}</LargeHeader>
                <div class="flex flex-1 flex-col justify-between gap-2">
                    <div class="flex-1" />
                    <div class="flex flex-col items-center">
                        <AmountEditable
                            initialAmountSats={amountSats()}
                            setAmountSats={setAmountSats}
                        />
                        <SharpButton disabled onClick={() => {}}>
                            <Users class="w-[18px]" />
                            {fromFed()?.federation_name}
                            <AmountSats
                                amountSats={calculateMaxFederation()}
                                denominationSize="sm"
                            />
                        </SharpButton>
                        <ArrowDown class="h-4 w-4" />
                        <SharpButton disabled onClick={() => {}}>
                            <Users class="w-[18px]" />
                            {toFed()?.federation_name}
                            <AmountSats
                                amountSats={toBalance()}
                                denominationSize="sm"
                            />
                        </SharpButton>
                    </div>
                    <div class="flex-1" />
                    <VStack>
                        <Button
                            disabled={!canTransfer()}
                            intent="blue"
                            onClick={handleTransfer}
                            loading={loading()}
                        >
                            {i18n.t("transfer.confirm")}
                        </Button>
                    </VStack>
                </div>
            </DefaultMain>
        </MutinyWalletGuard>
    );
}
