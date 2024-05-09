import { LnUrlParams } from "@mutinywallet/mutiny-wasm";
import { useNavigate } from "@solidjs/router";
import {
    createEffect,
    createMemo,
    createResource,
    createSignal,
    Match,
    Show,
    Suspense,
    Switch
} from "solid-js";

import {
    AmountEditable,
    AmountFiat,
    AmountSats,
    BackLink,
    Button,
    DefaultMain,
    Failure,
    InfoBox,
    LargeHeader,
    LoadingShimmer,
    MegaCheck,
    MutinyWalletGuard,
    NavBar,
    ReceiveWarnings,
    showToast,
    SuccessModal,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify, vibrateSuccess } from "~/utils";

type RedeemState = "edit" | "paid" | "already_paid";

export function Redeem() {
    const [state, _actions, sw] = useMegaStore();
    const navigate = useNavigate();
    const i18n = useI18n();

    const [amount, setAmount] = createSignal<bigint>(0n);
    // const [whatForInput, setWhatForInput] = createSignal("");
    const [lnurlData, setLnUrlData] = createSignal<LnUrlParams>();
    const [lnurlString, setLnUrlString] = createSignal("");
    const [fixedAmount, setFixedAmount] = createSignal(false);

    const [redeemState, setRedeemState] = createSignal<RedeemState>("edit");

    // loading state for the continue button
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<string>("");

    function mSatsToSats(mSats: bigint | number) {
        const bigMsats = BigInt(mSats);
        return bigMsats / 1000n;
    }

    function clearAll() {
        setAmount(0n);
        setLnUrlData(undefined);
        setLnUrlString("");
        setFixedAmount(false);
        setRedeemState("edit");
        setLoading(false);
        setError("");
    }

    //
    // Lnurl stuff
    //
    const [decodedLnurl] = createResource(async () => {
        if (state.scan_result && state.scan_result.lnurl) {
            const decoded = await sw.decode_lnurl(state.scan_result.lnurl);
            return decoded;
        }
    });

    createEffect(() => {
        if (decodedLnurl()) {
            processLnurl(decodedLnurl()!);
        }
    });

    // A ParsedParams with an lnurl in it
    async function processLnurl(decoded: LnUrlParams) {
        if (decoded.tag === "withdrawRequest") {
            if (decoded.min === decoded.max) {
                console.log("fixed amount", decoded.max.toString());
                setAmount(mSatsToSats(decoded.max));
                setFixedAmount(true);
            } else {
                setAmount(mSatsToSats(decoded.min));
                setFixedAmount(false);
            }
            setLnUrlData(decoded);
            setLnUrlString(state.scan_result?.lnurl || "");
        }
    }

    const lnurlAmountText = createMemo(() => {
        if (lnurlData()) {
            return i18n.t("redeem.lnurl_amount_message", {
                min: mSatsToSats(lnurlData()!.min).toLocaleString(),
                max: mSatsToSats(lnurlData()!.max).toLocaleString()
            });
        }
    });

    const lnUrlCanSend = createMemo(() => {
        const lnurlParams = lnurlData();
        if (!lnurlParams) return false;
        const min = mSatsToSats(lnurlParams.min);
        const max = mSatsToSats(lnurlParams.max);
        if (amount() === 0n || amount() < min || amount() > max) return false;

        return true;
    });

    async function handleLnUrlWithdrawal() {
        const lnurlParams = lnurlData();
        if (!lnurlParams) return;

        setError("");
        setLoading(true);

        try {
            const success = await sw.lnurl_withdraw(lnurlString(), amount());
            if (!success) {
                setError(i18n.t("redeem.lnurl_redeem_failed"));
            } else {
                setRedeemState("paid");
                await vibrateSuccess();
            }
        } catch (e) {
            console.error("lnurl_withdraw failed", e);
            showToast(eify(e));
        } finally {
            setLoading(false);
        }
    }

    //
    // Cashu stuff
    //
    const [decodedCashuToken] = createResource(async () => {
        if (state.scan_result && state.scan_result.cashu_token) {
            // If it's a cashu token we already have what we need
            const token = state.scan_result?.cashu_token;
            const amount = state.scan_result?.amount_sats;
            if (amount) {
                setAmount(amount);
                setFixedAmount(true);
            }

            return token;
        }
    });

    const cashuCanSend = createMemo(() => {
        if (!decodedCashuToken()) return false;
        if (amount() === 0n) return false;
        return true;
    });

    async function meltCashuToken() {
        try {
            setError("");
            setLoading(true);
            if (!state.scan_result?.cashu_token) return;
            await sw.melt_cashu_token(state.scan_result?.cashu_token);
            setRedeemState("paid");
            await vibrateSuccess();
        } catch (e) {
            console.error("melt_cashu_token failed", e);
            const err = eify(e);
            if (err.message === "Token has been already spent.") {
                setRedeemState("already_paid");
            } else {
                showToast(err);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <BackLink />
                <LargeHeader>{i18n.t("redeem.redeem_bitcoin")}</LargeHeader>
                <Switch>
                    <Match when={redeemState() === "edit"}>
                        <div class="flex-1" />
                        <VStack>
                            <Suspense
                                fallback={
                                    <div class="self-center">
                                        <LoadingShimmer />
                                    </div>
                                }
                            >
                                <Switch>
                                    <Match when={decodedLnurl() && lnurlData()}>
                                        <AmountEditable
                                            initialAmountSats={amount() || "0"}
                                            setAmountSats={setAmount}
                                            onSubmit={handleLnUrlWithdrawal}
                                            frozenAmount={fixedAmount()}
                                        />
                                    </Match>
                                    <Match when={decodedCashuToken()}>
                                        <AmountEditable
                                            initialAmountSats={amount() || "0"}
                                            setAmountSats={() => {}}
                                            onSubmit={() => {}}
                                            frozenAmount={fixedAmount()}
                                        />
                                    </Match>
                                </Switch>
                            </Suspense>
                            <ReceiveWarnings
                                amountSats={amount() || 0n}
                                from_fedi_to_ln={false}
                            />
                            <Show when={lnurlAmountText() && !fixedAmount()}>
                                <InfoBox accent="white">
                                    <p>{lnurlAmountText()}</p>
                                </InfoBox>
                            </Show>
                            <Show when={error()}>
                                <InfoBox accent="red">
                                    <p>{error()}</p>
                                </InfoBox>
                            </Show>
                        </VStack>
                        <div class="flex-1" />
                        <VStack>
                            {/* TODO: add tagging to lnurlwithdrawal and all the redeem flows */}
                            {/* <form onSubmit={handleLnUrlWithdrawal}>
                                <SimpleInput
                                    type="text"
                                    value={whatForInput()}
                                    placeholder={i18n.t("receive.what_for")}
                                    onInput={(e) =>
                                        setWhatForInput(e.currentTarget.value)
                                    }
                                />
                            </form> */}
                            <Switch>
                                <Match when={lnurlData()}>
                                    <Button
                                        disabled={!amount() || !lnUrlCanSend()}
                                        intent="green"
                                        onClick={handleLnUrlWithdrawal}
                                        loading={loading()}
                                    >
                                        {i18n.t("common.continue")}
                                    </Button>
                                </Match>
                                <Match when={decodedCashuToken()}>
                                    <Button
                                        disabled={!amount() || !cashuCanSend()}
                                        intent="green"
                                        onClick={meltCashuToken}
                                        loading={loading()}
                                    >
                                        {i18n.t("common.continue")}
                                    </Button>
                                </Match>
                            </Switch>
                        </VStack>
                    </Match>
                    <Match when={redeemState() === "paid"}>
                        <SuccessModal
                            open={true}
                            setOpen={(open: boolean) => {
                                if (!open) clearAll();
                            }}
                            onConfirm={() => {
                                clearAll();
                                navigate("/");
                            }}
                        >
                            <MegaCheck />
                            <h1 class="mb-2 mt-4 w-full text-center text-2xl font-semibold md:text-3xl">
                                {i18n.t("redeem.lnurl_redeem_success")}
                            </h1>
                            <div class="flex flex-col items-center gap-1">
                                <div class="text-xl">
                                    <AmountSats
                                        amountSats={amount()}
                                        icon="plus"
                                    />
                                </div>
                                <div class="text-white/70">
                                    <AmountFiat
                                        amountSats={amount()}
                                        denominationSize="sm"
                                    />
                                </div>
                            </div>
                            {/* TODO: add payment details */}
                        </SuccessModal>
                    </Match>
                    <Match when={redeemState() === "already_paid"}>
                        <SuccessModal
                            open={true}
                            setOpen={(open: boolean) => {
                                if (!open) clearAll();
                            }}
                            onConfirm={() => {
                                clearAll();
                                navigate("/");
                            }}
                            confirmText={i18n.t("common.dangit")}
                        >
                            <Failure
                                reason={i18n.t("redeem.cashu_already_spent")}
                            />
                        </SuccessModal>
                    </Match>
                </Switch>
            </DefaultMain>
            <NavBar activeTab="receive" />
        </MutinyWalletGuard>
    );
}
