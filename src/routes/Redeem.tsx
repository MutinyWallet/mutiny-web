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

type RedeemState = "edit" | "paid";

export function Redeem() {
    const [state, _actions] = useMegaStore();
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

    function mSatsToSats(mSats: bigint) {
        return mSats / 1000n;
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

    const [decodedLnurl] = createResource(async () => {
        if (state.scan_result) {
            if (state.scan_result.lnurl) {
                const decoded = await state.mutiny_wallet?.decode_lnurl(
                    state.scan_result.lnurl
                );
                return decoded;
            }
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

    const canSend = createMemo(() => {
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
            const success = await state.mutiny_wallet?.lnurl_withdraw(
                lnurlString(),
                amount()
            );
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
                                <Show when={decodedLnurl() && lnurlData()}>
                                    <AmountEditable
                                        initialAmountSats={amount() || "0"}
                                        setAmountSats={setAmount}
                                        onSubmit={handleLnUrlWithdrawal}
                                        frozenAmount={fixedAmount()}
                                    />
                                </Show>
                            </Suspense>
                            <ReceiveWarnings
                                amountSats={amount() || "0"}
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
                            <Button
                                disabled={!amount() || !canSend()}
                                intent="green"
                                onClick={handleLnUrlWithdrawal}
                                loading={loading()}
                            >
                                {i18n.t("common.continue")}
                            </Button>
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
                        <pre>NICE</pre>
                    </Match>
                </Switch>
            </DefaultMain>
            <NavBar activeTab="receive" />
        </MutinyWalletGuard>
    );
}
