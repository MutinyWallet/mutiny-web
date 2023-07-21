import { Match, Switch, createResource } from "solid-js";
import { useMegaStore } from "~/state/megaStore";
import {
    Card,
    DefaultMain,
    LargeHeader,
    MutinyWalletGuard,
    NiceP,
    SafeArea,
    SmallHeader,
    TinyText,
    VStack
} from "~/components/layout";
import { AmountSmall } from "~/components/Amount";
import { BackLink } from "~/components/layout/BackLink";
import NavBar from "~/components/NavBar";
import { useI18n } from "~/i18n/context";

function BalanceBar(props: { inbound: number; outbound: number }) {
    const i18n = useI18n();
    return (
        <VStack smallgap>
            <div class="flex justify-between">
                <SmallHeader>
                    {i18n.t("settings.channels.outbound")}
                </SmallHeader>
                <SmallHeader>{i18n.t("settings.channels.inbound")}</SmallHeader>
            </div>
            <div class="flex gap-1 w-full">
                <div
                    class="bg-m-green p-2 rounded-l-xl min-w-fit"
                    style={{
                        "flex-grow": props.outbound || 1
                    }}
                >
                    <AmountSmall amountSats={props.outbound} />
                </div>
                <div
                    class="bg-m-blue p-2 rounded-r-xl min-w-fit"
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
            let inbound = 0n;

            for (const channel of channels) {
                inbound =
                    inbound +
                    BigInt(channel.size) -
                    BigInt(channel.balance + channel.reserve);
            }

            return { inbound, channelCount: channels?.length };
        } catch (e) {
            console.error(e);
            return { inbound: 0, channelCount: 0 };
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
                        outbound={Number(state.balance?.lightning) || 0}
                    />
                    <TinyText>
                        {i18n.t("settings.channels.inbound_outbound_tip")}
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
