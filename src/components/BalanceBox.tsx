import { A, useNavigate } from "@solidjs/router";
import { Plus, Shuffle, Trash, Users } from "lucide-solid";
import {
    createMemo,
    createResource,
    createSignal,
    Match,
    Show,
    Suspense,
    Switch
} from "solid-js";

import {
    AmountFiat,
    AmountSats,
    ButtonCard,
    FancyCard,
    Indicator,
    InfoBox,
    MediumHeader,
    NiceP,
    SubtleButton,
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
    const [state, _actions, sw] = useMegaStore();
    const navigate = useNavigate();
    const i18n = useI18n();

    const [nodeManagerLoading, setNodeManagerLoading] = createSignal(false);

    const lightningBalance = () => state.balance?.lightning || 0n;

    const totalOnchain = createMemo(
        () =>
            (state.balance?.confirmed || 0n) +
            (state.balance?.unconfirmed || 0n) +
            (state.balance?.force_close || 0n)
    );

    const usableOnchain = createMemo(
        () =>
            (state.balance?.confirmed || 0n) +
            (state.balance?.unconfirmed || 0n)
    );

    const [hasSelfCustody, { refetch }] = createResource(async () => {
        // short circuit if we have a balance
        if (totalOnchain() > 0 || state.balance?.lightning || 0n > 0n) {
            return true;
        }

        // otherwise check if we have created a node
        const nodes: string[] = await sw.list_nodes();
        return nodes.length > 0;
    });

    const createNodeManager = async () => {
        if (confirm("Pass this test:")) {
            setNodeManagerLoading(true);
            await sw.create_node_manager_if_needed();
            await refetch();
            setNodeManagerLoading(false);
        }
    };

    const removeNodeManager = async () => {
        if (confirm("Are you sure:")) {
            setNodeManagerLoading(true);
            await sw.remove_node_manager();
            await refetch();
            setNodeManagerLoading(false);
        }
    };

    return (
        <VStack>
            <Switch>
                <Match when={state.federations && state.federations.length}>
                    <MediumHeader>Fedimint</MediumHeader>
                    <FancyCard>
                        <Show
                            when={!props.loading}
                            fallback={<LoadingShimmer />}
                        >
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
                                        <Suspense>
                                            <AmountFiat
                                                amountSats={
                                                    state.balance?.federation ||
                                                    0n
                                                }
                                                denominationSize="sm"
                                            />
                                        </Suspense>
                                    </div>
                                </div>
                                <Show
                                    when={state.balance?.federation || 0n > 0n}
                                >
                                    <div class="self-end justify-self-end">
                                        <A href="/swaplightning" class={STYLE}>
                                            <Shuffle class="h-6 w-6" />
                                        </A>
                                    </div>
                                </Show>
                            </div>
                        </Show>
                    </FancyCard>
                    <ButtonCard
                        onClick={() => navigate("/settings/federations")}
                    >
                        <div class="flex items-center gap-2">
                            <Users class="inline-block text-m-red" />
                            <NiceP>{i18n.t("profile.manage_federation")}</NiceP>
                        </div>
                    </ButtonCard>
                </Match>
                <Match when={true}>
                    <ButtonCard
                        onClick={() => navigate("/settings/federations")}
                    >
                        <div class="flex items-center gap-2">
                            <Users class="inline-block text-m-red" />
                            <NiceP>{i18n.t("profile.join_federation")}</NiceP>
                        </div>
                    </ButtonCard>
                </Match>
            </Switch>
            <MediumHeader>{i18n.t("profile.self_custody")}</MediumHeader>
            <Suspense>
                <Switch>
                    <Match when={hasSelfCustody()}>
                        <FancyCard>
                            <Show
                                when={!props.loading}
                                fallback={<LoadingShimmer />}
                            >
                                <Switch>
                                    <Match when={state.safe_mode}>
                                        <div class="flex flex-col gap-1">
                                            <InfoBox accent="red">
                                                {i18n.t(
                                                    "common.error_safe_mode"
                                                )}
                                            </InfoBox>
                                        </div>
                                    </Match>
                                    <Match when={true}>
                                        <div class="flex flex-col gap-1">
                                            <div class="text-2xl">
                                                <AmountSats
                                                    amountSats={lightningBalance()}
                                                    icon="lightning"
                                                    denominationSize="lg"
                                                />
                                            </div>
                                            <div class="text-lg text-white/70">
                                                <Suspense>
                                                    <AmountFiat
                                                        amountSats={lightningBalance()}
                                                        denominationSize="sm"
                                                    />
                                                </Suspense>
                                            </div>
                                        </div>
                                    </Match>
                                </Switch>
                            </Show>
                            <hr class="my-2 border-m-grey-750" />
                            <Show
                                when={!props.loading}
                                fallback={<LoadingShimmer />}
                            >
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
                                            <Suspense>
                                                <AmountFiat
                                                    amountSats={totalOnchain()}
                                                    denominationSize="sm"
                                                />
                                            </Suspense>
                                        </div>
                                    </div>
                                    <div class="flex flex-col items-end justify-between gap-1">
                                        <Show
                                            when={
                                                state.balance?.unconfirmed != 0n
                                            }
                                        >
                                            <Indicator>
                                                {i18n.t("common.pending")}
                                            </Indicator>
                                        </Show>
                                        <Show
                                            when={
                                                state.balance?.unconfirmed ===
                                                0n
                                            }
                                        >
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
                                <Show
                                    when={
                                        totalOnchain() === 0n &&
                                        lightningBalance() === 0n &&
                                        state.federations &&
                                        state.federations.length
                                    }
                                >
                                    <SubtleButton
                                        onClick={removeNodeManager}
                                        loading={nodeManagerLoading()}
                                    >
                                        <Trash class="h-4 w-4" />
                                    </SubtleButton>
                                </Show>
                            </Show>
                        </FancyCard>
                    </Match>
                    <Match when={true}>
                        <SubtleButton
                            onClick={createNodeManager}
                            loading={nodeManagerLoading()}
                        >
                            <Plus class="h-4 w-4" />
                        </SubtleButton>
                    </Match>
                </Switch>
            </Suspense>
        </VStack>
    );
}
