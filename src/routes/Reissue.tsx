/* @refresh reload */

import { useNavigate } from "@solidjs/router";
import {
    createSignal,
    Match,
    Show,
    Switch
} from "solid-js";

import {
    ActivityDetailsModal,
    AmountEditable,
    AmountFiat,
    AmountSats,
    BackButton,
    BackLink,
    Button,
    DefaultMain,
    HackActivityType,
    Indicator,
    InfoBox,
    LargeHeader,
    MegaCheck,
    MutinyWalletGuard,
    NavBar,
    SuccessModal,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

type ReissueState = "show" | "success" | "failed";

export function Reissue() {
    const [state, actions] = useMegaStore();
    const navigate = useNavigate();
    const i18n = useI18n();

    const [amount, setAmount] = createSignal<bigint>(0n);

    const [reissueState, setReissueState] = createSignal<ReissueState>("show");

    // loading state for the continue button
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<string>("");

    // Details Modal
    const [detailsOpen, setDetailsOpen] = createSignal(false);
    const [detailsKind, setDetailsKind] = createSignal<HackActivityType>();
    const [detailsId, setDetailsId] = createSignal<string>("");

    function clearAll() {
        setAmount(0n);
        setReissueState("show");
        setError("");
    }

    async function onSubmit(e: Event) {
        e.preventDefault();

        await reissueEcash();
    }

    async function reissueEcash() {
        const currState = reissueState();
        console.log(currState);

        setLoading(true);
        try {
            await state.mutiny_wallet?.reissue_oob_notes(state.scan_result?.fedimint_oob_notes!);
            setReissueState("success");
            const currState = reissueState();
            console.log(currState);
        } catch (e) {
            setReissueState("failed");
            setError(e);
            console.log(e);
        }
        setLoading(false);

    }

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <Show when={reissueState() === "show"} fallback={<BackLink />}>
                    <BackButton
                        onClick={() => clearAll()}
                        title={i18n.t("reissue.edit")}
                        showOnDesktop
                    />
                </Show>
                <LargeHeader
                    action={
                        reissueState() === "show" && (
                            <Indicator>{i18n.t("reissue.checking")}</Indicator>
                        )
                    }
                >
                    {i18n.t("reissue.reissue_ecash")}
                </LargeHeader>
                <Switch>
                    <Match when={reissueState() === "show"}>
                        <div class="flex-1" />
                        <VStack>
                            <AmountEditable
                                initialAmountSats={state.scan_result?.amount_sats! || "0"}
                                frozenAmount={true}
                                setAmountSats={() => { }}>
                            </AmountEditable>
                        </VStack>
                        <div class="flex-1" />
                        <VStack>
                            {/* TODO: (@leonardo) add the info input field ? */}
                            <Button
                                disabled={!state.scan_result?.amount_sats}
                                intent="green"
                                onClick={onSubmit}
                                loading={loading()}
                            >
                                {i18n.t("common.continue")}
                            </Button>
                        </VStack>
                    </Match>
                    <Match when={reissueState() === "success"}>
                        <SuccessModal
                            open={!!reissueState()}
                            setOpen={(open: boolean) => {
                                if (!open) clearAll();
                            }}
                            onConfirm={() => {
                                clearAll();
                                navigate("/");
                            }}
                        >
                            <Show when={detailsId() && detailsKind()}>
                                <ActivityDetailsModal
                                    open={detailsOpen()}
                                    kind={detailsKind()}
                                    id={detailsId()}
                                    setOpen={setDetailsOpen}
                                />
                            </Show>
                            <MegaCheck />
                            <h1 class="mb-2 mt-4 w-full text-center text-2xl font-semibold md:text-3xl">
                                {i18n.t("reissue.payment_received")}
                            </h1>
                            <div class="flex flex-col items-center gap-1">
                                <div class="text-xl">
                                    <AmountSats
                                        amountSats={state.scan_result?.amount_sats}
                                        icon="plus"
                                    />
                                </div>
                                <div class="text-white/70">
                                    <AmountFiat
                                        amountSats={state.scan_result?.amount_sats}
                                        denominationSize="sm"
                                    />
                                </div>
                            </div>
                            {/* TODO: (@leonardo) add the FederationId ? */}
                            <hr class="w-16 bg-m-grey-400" />
                            {/* <Show
                                when={
                                    receiveState() === "paid" &&
                                    paidState() === "lightning_paid"
                                }
                            >
                                <Fee amountSats={lspFee()} />
                            </Show> */}
                        </SuccessModal>
                    </Match>
                    <Match when={reissueState() === "failed"}>
                        <Show when={error}>
                            <InfoBox accent="red">{error}</InfoBox>
                        </Show>
                    </Match>
                </Switch>
            </DefaultMain>
            <NavBar activeTab="reissue" />
        </MutinyWalletGuard>
    );
}
