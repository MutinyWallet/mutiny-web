import { createResource, Match, Switch } from "solid-js";

import {
    AmountSmall,
    BackLink,
    Card,
    DefaultMain,
    LargeHeader,
    MutinyWalletGuard,
    NavBar,
    NiceP,
    SafeArea,
    SmallHeader,
    TinyText,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function BalanceBar(props: {
    inbound: number;
    reserve: number;
    outbound: number;
}) {
    const i18n = useI18n();
    return (
        <VStack smallgap>
            <div class="flex justify-between">
                <SmallHeader>
                    {i18n.t("settings.channels.outbound")}
                </SmallHeader>
                <SmallHeader>{i18n.t("settings.channels.reserve")}</SmallHeader>
                <SmallHeader>{i18n.t("settings.channels.inbound")}</SmallHeader>
            </div>
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

export function LiquidityMonitor() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const [channelInfo] = createResource(async () => {
        try {
            const channels = await state.mutiny_wallet?.list_channels();
            let outbound = 0n;
            let inbound = 0n;
            let reserve = 0n;

            for (const channel of channels) {
                inbound =
                    inbound +
                    BigInt(channel.size) -
                    BigInt(channel.balance + channel.reserve);
                reserve = reserve + BigInt(channel.reserve);
                outbound = outbound + BigInt(channel.balance);
            }

            return {
                inbound,
                reserve,
                outbound,
                channelCount: channels?.length
            };
        } catch (e) {
            console.error(e);
            return { inbound: 0, reserve: 0, outbound: 0, channelCount: 0 };
        }
    });

    return (
        <Switch>
            <Match when={channelInfo()?.channelCount}>
                <Card>
                    <NiceP>
                        {i18n.t("settings.channels.have_channels")}{" "}
                        {channelInfo()?.channelCount}{" "}
                        {channelInfo()?.channelCount === 1
                            ? i18n.t("settings.channels.have_channels_one")
                            : i18n.t("settings.channels.have_channels_many")}
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
            </Match>
            <Match when={true}>
                <NiceP>{i18n.t("settings.channels.no_channels")}</NiceP>
            </Match>
        </Switch>
    );
}

export default function Channels() {
    const i18n = useI18n();
    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink
                        href="/settings"
                        title={i18n.t("settings.header")}
                    />
                    <LargeHeader>
                        {i18n.t("settings.channels.title")}
                    </LargeHeader>
                    <LiquidityMonitor />
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
