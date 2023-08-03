import { createResource, createSignal, Match, Show, Switch } from "solid-js";
import { useSearchParams } from "solid-start";

import treasureClosed from "~/assets/treasure-closed.png";
import treasure from "~/assets/treasure.gif";
import {
    AmountFiat,
    AmountSats,
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
    SafeArea,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { Network } from "~/logic/mutinyWalletSetup";
import { useMegaStore } from "~/state/megaStore";
import { eify } from "~/utils";

export default function GiftPage() {
    const [state, _] = useMegaStore();
    const i18n = useI18n();

    const [claimSuccess, setClaimSuccess] = createSignal(false);
    const [error, setError] = createSignal<Error>();
    const [loading, setLoading] = createSignal(false);

    const [searchParams] = useSearchParams();

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
        const amount = Number(searchParams.amount);

        if (isNaN(amount)) {
            return undefined;
        }

        const network = state.mutiny_wallet?.get_network() as Network;

        const threshold = network === "bitcoin" ? 50000 : 10000;
        const balance = state.balance?.lightning || 0n;

        if (balance === 0n && amount < threshold) {
            return i18n.t("settings.gift.receive_too_small", {
                amount: network === "bitcoin" ? "50,000" : "10,000"
            });
        }

        if (amount > (inboundCapacity() || 0)) {
            return i18n.t("settings.gift.setup_fee_lightning");
        }

        return undefined;
    };

    async function claim() {
        const amount = Number(searchParams.amount);
        const nwc = searchParams.nwc_uri;
        setLoading(true);
        try {
            const claimResult = await state.mutiny_wallet?.claim_single_use_nwc(
                BigInt(amount),
                nwc
            );
            console.log("claim result", claimResult);
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
            setError(eify(e));
        } finally {
            setLoading(false);
        }
    }

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
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
                                    <Show
                                        when={warningText() && !claimSuccess()}
                                    >
                                        <InfoBox accent="blue">
                                            {warningText()} <FeesModal />
                                        </InfoBox>
                                    </Show>
                                    <Switch>
                                        <Match when={error()}>
                                            <InfoBox accent="red">
                                                {error()?.message}
                                            </InfoBox>
                                            <ButtonLink href="/" intent="red">
                                                {i18n.t("common.dangit")}
                                            </ButtonLink>
                                        </Match>
                                        <Match when={claimSuccess()}>
                                            <InfoBox accent="green">
                                                {i18n.t(
                                                    "settings.gift.receive_claimed"
                                                )}
                                            </InfoBox>
                                            <ButtonLink
                                                href="/"
                                                intent="inactive"
                                            >
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
            </SafeArea>
        </MutinyWalletGuard>
    );
}
