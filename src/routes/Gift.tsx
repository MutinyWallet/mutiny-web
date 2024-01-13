import { useSearchParams } from "@solidjs/router";
import {
    createMemo,
    createResource,
    createSignal,
    Match,
    Show,
    Suspense,
    Switch
} from "solid-js";

import treasureClosed from "~/assets/treasure-closed.png";
import treasure from "~/assets/treasure.gif";
import {
    AmountFiat,
    AmountSats,
    BackLink,
    Button,
    ButtonLink,
    DefaultMain,
    FancyCard,
    FeesModal,
    InfoBox,
    Logo,
    MutinyWalletGuard,
    NavBar,
    NiceP,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { Network } from "~/logic/mutinyWalletSetup";
import { useMegaStore } from "~/state/megaStore";
import { eify } from "~/utils";

function InboundWarning() {
    const [state, _] = useMegaStore();
    const i18n = useI18n();
    const [searchParams] = useSearchParams();

    const [inboundCapacity] = createResource(async () => {
        try {
            const channels = await state.mutiny_wallet?.list_channels();
            let inbound = 0n;

            for (const channel of channels) {
                inbound =
                    inbound +
                    BigInt(channel.size) -
                    BigInt(channel.balance + channel.reserve);
            }

            return inbound;
        } catch (e) {
            console.error(e);
            return 0n;
        }
    });

    const warningText = createMemo(() => {
        if (isNaN(Number(searchParams.amount))) {
            return undefined;
        }

        const amountNumber = Number(searchParams.amount);

        const amount = BigInt(amountNumber);

        const network = state.mutiny_wallet?.get_network() as Network;

        const threshold = network === "bitcoin" ? 100000 : 10000;
        const balance =
            (state.balance?.lightning || 0n) +
            (state.balance?.federation || 0n);

        if (balance === 0n && amount < threshold) {
            return i18n.t("settings.gift.receive_too_small", {
                amount: network === "bitcoin" ? "100,000" : "10,000"
            });
        }

        if (inboundCapacity() && inboundCapacity()! > amount) {
            return undefined;
        } else {
            return i18n.t("settings.gift.setup_fee_lightning");
        }
    });

    return (
        <Show when={warningText()}>
            <InfoBox accent="blue">
                {warningText()} <FeesModal />
            </InfoBox>
        </Show>
    );
}

export function Gift() {
    const [state, _] = useMegaStore();
    const i18n = useI18n();

    const [claimSuccess, setClaimSuccess] = createSignal(false);
    const [error, setError] = createSignal<Error>();
    const [loading, setLoading] = createSignal(false);

    const [searchParams] = useSearchParams();

    async function claim() {
        const amount = Number(searchParams.amount);
        const nwc = searchParams.nwc_uri;
        setLoading(true);
        if (!nwc) {
            throw new Error(i18n.t("settings.gift.something_went_wrong"));
        }
        try {
            const claimResult = await state.mutiny_wallet?.claim_single_use_nwc(
                BigInt(amount),
                nwc
            );
            if (claimResult === "Already Claimed") {
                throw new Error(i18n.t("settings.gift.already_claimed"));
            }
            if (
                claimResult ===
                "Failed to pay invoice: We do not have enough balance to pay the given amount."
            ) {
                throw new Error(i18n.t("settings.gift.sender_is_poor"));
            }
            // Fallback for any other errors
            if (claimResult) {
                throw new Error(
                    i18n.t("settings.gift.sender_generic_error", {
                        error: claimResult
                    })
                );
            }
            setClaimSuccess(true);
        } catch (e) {
            console.error(e);
            const err = eify(e);
            if (err.message === "Payment timed out.") {
                setError(new Error(i18n.t("settings.gift.sender_timed_out")));
            } else {
                setError(err);
            }
        } finally {
            setLoading(false);
        }
    }

    async function tryAgain() {
        setError(undefined);
        await claim();
    }

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <BackLink />
                <Show when={searchParams.nwc_uri && searchParams.amount}>
                    <VStack>
                        <FancyCard>
                            <VStack>
                                <div class="flex items-start justify-between">
                                    <VStack smallgap>
                                        <span class="text-3xl">
                                            <AmountSats
                                                denominationSize="xl"
                                                amountSats={Number(
                                                    searchParams.amount
                                                )}
                                            />
                                        </span>
                                        <span class="text-xl text-white/70">
                                            <AmountFiat
                                                denominationSize="xl"
                                                amountSats={Number(
                                                    searchParams.amount
                                                )}
                                            />
                                        </span>
                                    </VStack>
                                    <Logo />
                                </div>

                                <div
                                    class="relative transition-all duration-500"
                                    classList={{
                                        "grayscale filter opacity-75":
                                            !claimSuccess()
                                    }}
                                >
                                    <img
                                        src={treasureClosed}
                                        fetchpriority="high"
                                        class="mx-auto w-1/2"
                                        classList={{
                                            hidden: !!claimSuccess()
                                        }}
                                    />
                                    <img
                                        src={treasure}
                                        fetchpriority="high"
                                        class="mx-auto w-1/2"
                                        classList={{
                                            hidden: !claimSuccess()
                                        }}
                                    />
                                </div>
                                <h2 class="text-center text-3xl font-semibold">
                                    {i18n.t("settings.gift.receive_header")}
                                </h2>
                                <NiceP>
                                    {i18n.t(
                                        "settings.gift.receive_description"
                                    )}
                                </NiceP>
                                <Show when={!claimSuccess()}>
                                    <Suspense>
                                        <InboundWarning />
                                    </Suspense>
                                </Show>
                                <Switch>
                                    <Match when={error()}>
                                        <InfoBox accent="red">
                                            {error()?.message}
                                        </InfoBox>
                                        <ButtonLink href="/" intent="red">
                                            {i18n.t("common.dangit")}
                                        </ButtonLink>
                                        <Button
                                            intent="inactive"
                                            onClick={tryAgain}
                                            loading={loading()}
                                        >
                                            {i18n.t(
                                                "settings.gift.receive_try_again"
                                            )}
                                        </Button>
                                    </Match>
                                    <Match when={claimSuccess()}>
                                        <InfoBox accent="green">
                                            {i18n.t(
                                                "settings.gift.receive_claimed"
                                            )}
                                        </InfoBox>
                                        <ButtonLink href="/" intent="inactive">
                                            {i18n.t("common.nice")}
                                        </ButtonLink>
                                    </Match>
                                    <Match when={true}>
                                        <Button
                                            intent="inactive"
                                            onClick={claim}
                                            loading={loading()}
                                        >
                                            {i18n.t(
                                                "settings.gift.receive_cta"
                                            )}
                                        </Button>
                                    </Match>
                                </Switch>
                            </VStack>
                        </FancyCard>
                    </VStack>
                </Show>
            </DefaultMain>
            <NavBar activeTab="none" />
        </MutinyWalletGuard>
    );
}
