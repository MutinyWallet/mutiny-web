import { MutinyChannel } from "@mutinywallet/mutiny-wasm";
import {
    createEffect,
    createMemo,
    createResource,
    createSignal,
    For,
    Match,
    Show,
    Suspense,
    Switch
} from "solid-js";

import {
    AmountSmall,
    BackLink,
    Card,
    Collapser,
    ConfirmDialog,
    DefaultMain,
    ExternalLink,
    LargeHeader,
    MutinyWalletGuard,
    NavBar,
    NiceP,
    SettingsCard,
    showToast,
    SmallHeader,
    TinyText,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { Network } from "~/logic/mutinyWalletSetup";
import { useMegaStore } from "~/state/megaStore";
import { createDeepSignal, eify, mempoolTxUrl } from "~/utils";

export function BalanceBar(props: {
    inbound: number;
    reserve: number;
    outbound: number;
    hideHeader?: boolean;
}) {
    const i18n = useI18n();
    return (
        <VStack smallgap>
            <Show when={!props.hideHeader}>
                <div class="flex justify-between">
                    <SmallHeader>
                        {i18n.t("settings.channels.outbound")}
                    </SmallHeader>
                    <SmallHeader>
                        {i18n.t("settings.channels.reserve")}
                    </SmallHeader>
                    <SmallHeader>
                        {i18n.t("settings.channels.inbound")}
                    </SmallHeader>
                </div>
            </Show>
            <div class="flex w-full gap-1">
                <div
                    class="min-w-fit rounded-l-xl bg-m-green p-2"
                    style={{
                        "flex-grow": props.outbound || 1
                    }}
                >
                    <AmountSmall amountSats={props.outbound} />
                </div>
                <div
                    class="min-w-fit bg-m-grey-400 p-2"
                    style={{
                        "flex-grow": props.reserve
                    }}
                >
                    <AmountSmall amountSats={props.reserve} />
                </div>
                <div
                    class="min-w-fit rounded-r-xl bg-m-blue p-2"
                    style={{
                        "flex-grow": props.inbound || 1
                    }}
                >
                    <AmountSmall amountSats={props.inbound} />
                </div>
            </div>
        </VStack>
    );
}

function splitChannelNumbers(channel: MutinyChannel): {
    inbound: number;
    reserve: number;
    outbound: number;
} {
    return {
        inbound: Number(channel.inbound) || 0,
        reserve: Number(channel.reserve),
        outbound: Number(channel.balance)
    };
}

function SingleChannelItem(props: { channel: MutinyChannel; online: boolean }) {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();
    const network = state.mutiny_wallet?.get_network() as Network;

    const [confirmOpen, setConfirmOpen] = createSignal(false);
    const [confirmLoading, setConfirmLoading] = createSignal(false);

    function confirmChannelClose() {
        setConfirmOpen(true);
    }

    async function closeChannel() {
        try {
            if (!props.channel.outpoint) return;
            setConfirmLoading(true);
            const forceClose = !props.online;
            await state.mutiny_wallet?.close_channel(
                props.channel.outpoint,
                forceClose,
                false
            );
        } catch (e) {
            console.error(e);
            showToast(eify(e));
        } finally {
            setConfirmOpen(false);
            setConfirmLoading(false);
        }
    }

    const channelDetails = createMemo(() => splitChannelNumbers(props.channel));

    return (
        <Card>
            <VStack smallgap>
                <BalanceBar
                    inbound={channelDetails().inbound}
                    reserve={channelDetails().reserve}
                    outbound={channelDetails().outbound}
                    hideHeader
                />
                <div class="flex justify-between text-sm">
                    <ExternalLink
                        href={mempoolTxUrl(
                            props.channel.outpoint?.split(":")[0],
                            network
                        )}
                    >
                        {i18n.t("common.view_transaction")}
                    </ExternalLink>
                    <button
                        onClick={confirmChannelClose}
                        class="self-center font-semibold text-m-red no-underline active:text-m-red/80"
                    >
                        {i18n.t("settings.channels.close_channel")}
                    </button>
                </div>
                <ConfirmDialog
                    loading={confirmLoading()}
                    open={confirmOpen()}
                    onConfirm={closeChannel}
                    onCancel={() => setConfirmOpen(false)}
                >
                    <Switch>
                        <Match when={!props.online}>
                            {i18n.t(
                                "settings.channels.force_close_channel_confirm"
                            )}
                        </Match>
                        <Match when={true}>
                            {i18n.t("settings.channels.close_channel_confirm")}
                        </Match>
                    </Switch>
                </ConfirmDialog>
            </VStack>
        </Card>
    );
}

function LiquidityMonitor() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    async function listChannels() {
        try {
            const channels: MutinyChannel[] | undefined =
                await state.mutiny_wallet?.list_channels();

            if (!channels)
                return {
                    inbound: 0,
                    reserve: 0,
                    outbound: 0,
                    channelCount: 0
                };

            let outbound = 0n;
            let inbound = 0n;
            let reserve = 0n;

            for (const channel of channels) {
                inbound = inbound + BigInt(channel.inbound);
                reserve = reserve + BigInt(channel.reserve);
                outbound = outbound + BigInt(channel.balance);
            }

            return {
                inbound,
                reserve,
                outbound,
                channelCount: channels?.length,
                online: channels?.filter((c) => c.is_usable),
                offline: channels?.filter((c) => !c.is_usable)
            };
        } catch (e) {
            console.error(e);
            return { inbound: 0, reserve: 0, outbound: 0, channelCount: 0 };
        }
    }

    const [channelInfo, { refetch }] = createResource(listChannels, {
        storage: createDeepSignal
    });

    createEffect(() => {
        // Refetch on the sync interval
        if (!state.is_syncing) {
            refetch();
        }
    });

    return (
        <Switch>
            <Match when={channelInfo()?.channelCount}>
                <VStack>
                    <Card>
                        <NiceP>
                            {i18n.t("settings.channels.have_channels")}{" "}
                            {channelInfo()?.channelCount}{" "}
                            {channelInfo()?.channelCount === 1
                                ? i18n.t("settings.channels.have_channels_one")
                                : i18n.t(
                                      "settings.channels.have_channels_many"
                                  )}
                        </NiceP>{" "}
                        <BalanceBar
                            inbound={Number(channelInfo()?.inbound) || 0}
                            reserve={Number(channelInfo()?.reserve) || 0}
                            outbound={Number(channelInfo()?.outbound) || 0}
                        />
                        <TinyText>
                            {i18n.t("settings.channels.inbound_outbound_tip")}
                        </TinyText>
                        <TinyText>
                            {i18n.t("settings.channels.reserve_tip")}
                        </TinyText>
                    </Card>
                    <Show when={channelInfo()?.online?.length}>
                        <SettingsCard>
                            <Collapser
                                title={i18n.t(
                                    "settings.channels.online_channels"
                                )}
                                activityLight="on"
                            >
                                <VStack>
                                    <For each={channelInfo()?.online}>
                                        {(channel) => (
                                            <SingleChannelItem
                                                channel={channel}
                                                online={true}
                                            />
                                        )}
                                    </For>
                                </VStack>
                            </Collapser>
                        </SettingsCard>
                    </Show>
                    <Show when={channelInfo()?.offline?.length}>
                        <SettingsCard>
                            <Collapser
                                title={i18n.t(
                                    "settings.channels.offline_channels"
                                )}
                                activityLight="off"
                            >
                                <VStack>
                                    <For each={channelInfo()?.offline}>
                                        {(channel) => (
                                            <SingleChannelItem
                                                channel={channel}
                                                online={false}
                                            />
                                        )}
                                    </For>
                                </VStack>
                            </Collapser>
                        </SettingsCard>
                    </Show>
                </VStack>
            </Match>
            <Match when={true}>
                <NiceP>{i18n.t("settings.channels.no_channels")}</NiceP>
            </Match>
        </Switch>
    );
}

export function Channels() {
    const i18n = useI18n();
    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <BackLink href="/settings" title={i18n.t("settings.header")} />
                <LargeHeader>{i18n.t("settings.channels.title")}</LargeHeader>
                <Suspense>
                    <LiquidityMonitor />
                </Suspense>
            </DefaultMain>
            <NavBar activeTab="settings" />
        </MutinyWalletGuard>
    );
}
