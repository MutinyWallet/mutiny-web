import { Show } from "solid-js";
import { Button, FancyCard, Indicator } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";
import { AmountSats, AmountFiat } from "./Amount";
import { A, useNavigate } from "solid-start";
import shuffle from "~/assets/icons/shuffle.svg";
import { useI18n } from "~/i18n/context";

export function LoadingShimmer() {
    return (
        <div class="flex flex-col gap-2 animate-pulse">
            <h1 class="text-4xl font-light">
                <div class="w-[12rem] rounded bg-neutral-700 h-[2.5rem]" />
            </h1>
            <h2 class="text-xl font-light text-white/70">
                <div class="w-[8rem] rounded bg-neutral-700 h-[1.75rem]" />
            </h2>
        </div>
    );
}

const STYLE =
    "px-2 py-1 rounded-xl text-sm flex gap-2 items-center font-semibold";

export default function BalanceBox(props: { loading?: boolean }) {
    const [state, _actions] = useMegaStore();
    const i18n = useI18n();

    const emptyBalance = () =>
        (state.balance?.confirmed || 0n) === 0n &&
        (state.balance?.lightning || 0n) === 0n &&
        (state.balance?.force_close || 0n) === 0n &&
        (state.balance?.unconfirmed || 0n) === 0n;

    const navigate = useNavigate();

    const totalOnchain = () =>
        (state.balance?.confirmed || 0n) +
        (state.balance?.unconfirmed || 0n) +
        (state.balance?.force_close || 0n);

    return (
        <>
            <FancyCard>
                <Show when={!props.loading} fallback={<LoadingShimmer />}>
                    <div class="flex flex-col gap-1">
                        <div class="text-2xl">
                            <AmountSats
                                amountSats={state.balance?.lightning || 0}
                                icon="lightning"
                                denominationSize="lg"
                            />
                        </div>
                        <div class="text-lg text-white/70">
                            <AmountFiat
                                amountSats={state.balance?.lightning || 0}
                                denominationSize="sm"
                            />
                        </div>
                    </div>
                </Show>
                <hr class="my-2 border-m-grey-750" />
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
                        <div class="flex flex-col items-end gap-1 justify-between">
                            <Show when={state.balance?.unconfirmed != 0n}>
                                <Indicator>
                                    {i18n.t("common.pending")}
                                </Indicator>
                            </Show>
                            <Show when={state.balance?.unconfirmed === 0n}>
                                <div />
                            </Show>
                            <Show when={totalOnchain() != 0n}>
                                <div class="self-end justify-self-end">
                                    <A href="/swap" class={STYLE}>
                                        <img
                                            src={shuffle}
                                            alt="swap"
                                            class="h-6 w-6"
                                        />
                                    </A>
                                </div>
                            </Show>
                        </div>
                    </div>
                </Show>
            </FancyCard>
            <div class="flex gap-2 py-4">
                <Button
                    onClick={() => navigate("/send")}
                    disabled={emptyBalance() || props.loading}
                    intent="green"
                >
                    {i18n.t("common.send")}
                </Button>
                <Button
                    onClick={() => navigate("/receive")}
                    disabled={props.loading}
                    intent="blue"
                >
                    {i18n.t("common.receive")}
                </Button>
            </div>
        </>
    );
}
