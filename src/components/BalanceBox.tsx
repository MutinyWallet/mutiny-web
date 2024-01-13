import { A } from "@solidjs/router";
import { Shuffle } from "lucide-solid";
import { Match, Show, Switch } from "solid-js";

import {
    AmountFiat,
    AmountSats,
    FancyCard,
    Indicator,
    InfoBox,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function LoadingShimmer(props: { center?: boolean; small?: boolean }) {
    return (
        <div class="flex animate-pulse flex-col gap-2">
            <h1
                class="text-4xl font-light"
                classList={{ "flex justify-center": props.center }}
            >
                <div
                    class="rounded bg-neutral-700"
                    classList={{
                        "h-[2.5rem] w-[12rem]": !props.small,
                        "h-[1rem] w-[8rem]": props.small
                    }}
                />
            </h1>
            <Show when={!props.small}>
                <h2
                    class="text-xl font-light text-white/70"
                    classList={{ "flex justify-center": props.center }}
                >
                    <div class="h-[1.75rem] w-[8rem] rounded bg-neutral-700" />
                </h2>
            </Show>
        </div>
    );
}

const STYLE =
    "px-2 py-1 rounded-xl text-sm flex gap-2 items-center font-semibold";

export function BalanceBox(props: { loading?: boolean; small?: boolean }) {
    const [state, _actions] = useMegaStore();
    const i18n = useI18n();

    const totalOnchain = () =>
        (state.balance?.confirmed || 0n) +
        (state.balance?.unconfirmed || 0n) +
        (state.balance?.force_close || 0n);

    const usableOnchain = () =>
        (state.balance?.confirmed || 0n) + (state.balance?.unconfirmed || 0n);

    return (
        <VStack>
            <FancyCard title="Lightning">
                <Show when={!props.loading} fallback={<LoadingShimmer />}>
                    <Switch>
                        <Match when={state.safe_mode}>
                            <div class="flex flex-col gap-1">
                                <InfoBox accent="red">
                                    {i18n.t("common.error_safe_mode")}
                                </InfoBox>
                            </div>
                        </Match>
                        <Match when={true}>
                            <div class="flex flex-col gap-1">
                                <div class="text-2xl">
                                    <AmountSats
                                        amountSats={
                                            state.balance?.lightning || 0
                                        }
                                        icon="lightning"
                                        denominationSize="lg"
                                    />
                                </div>
                                <div class="text-lg text-white/70">
                                    <AmountFiat
                                        amountSats={
                                            state.balance?.lightning || 0
                                        }
                                        denominationSize="sm"
                                    />
                                </div>
                            </div>
                        </Match>
                    </Switch>
                </Show>
            </FancyCard>
            <Show when={state.federations && state.federations.length}>
                <FancyCard title="Fedimint">
                    <Show when={!props.loading} fallback={<LoadingShimmer />}>
                        <div class="flex justify-between">
                            <div class="flex flex-col gap-1">
                                <div class="text-2xl">
                                    <AmountSats
                                        amountSats={
                                            state.balance?.federation || 0n
                                        }
                                        icon="community"
                                        denominationSize="lg"
                                        isFederation
                                    />
                                </div>
                                <div class="text-lg text-white/70">
                                    <AmountFiat
                                        amountSats={
                                            state.balance?.federation || 0n
                                        }
                                        denominationSize="sm"
                                    />
                                </div>
                            </div>

                            <Show when={state.balance?.federation || 0n > 0n}>
                                <div class="self-end justify-self-end">
                                    <A href="/swaplightning" class={STYLE}>
                                        <Shuffle class="h-6 w-6" />
                                    </A>
                                </div>
                            </Show>
                        </div>
                    </Show>
                </FancyCard>
            </Show>
            <FancyCard title="On-chain">
                {/* <hr class="my-2 border-m-grey-750" /> */}
                <Show when={!props.loading} fallback={<LoadingShimmer />}>
                    <div class="flex justify-between">
                        <div class="flex flex-col gap-1">
                            <div class="text-2xl">
                                <AmountSats
                                    amountSats={totalOnchain()}
                                    icon="chain"
                                    denominationSize="lg"
                                />
                            </div>
                            <div class="text-lg text-white/70">
                                <AmountFiat
                                    amountSats={totalOnchain()}
                                    denominationSize="sm"
                                />
                            </div>
                        </div>
                        <div class="flex flex-col items-end justify-between gap-1">
                            <Show when={state.balance?.unconfirmed != 0n}>
                                <Indicator>
                                    {i18n.t("common.pending")}
                                </Indicator>
                            </Show>
                            <Show when={state.balance?.unconfirmed === 0n}>
                                <div />
                            </Show>
                            <Show when={usableOnchain() > 0n}>
                                <div class="self-end justify-self-end">
                                    <A href="/swap" class={STYLE}>
                                        <Shuffle class="h-6 w-6" />
                                    </A>
                                </div>
                            </Show>
                        </div>
                    </div>
                </Show>
            </FancyCard>
        </VStack>
    );
}
