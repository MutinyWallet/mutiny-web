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

function BalanceBar(props: { inbound: number; outbound: number }) {
    return (
        <VStack smallgap>
            <div class="flex justify-between">
                <SmallHeader>Outbound</SmallHeader>
                <SmallHeader>Inbound</SmallHeader>
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
                        You have {channelInfo()?.channelCount} lightning{" "}
                        {channelInfo()?.channelCount === 1
                            ? "channel"
                            : "channels"}
                        .
                    </NiceP>{" "}
                    <BalanceBar
                        inbound={Number(channelInfo()?.inbound) || 0}
                        outbound={Number(state.balance?.lightning) || 0}
                    />
                    <TinyText>
                        Outbound is the amount of money you can spend on
                        lightning. Inbound is the amount you can receive without
                        incurring a lightning service fee.
                    </TinyText>
                </Card>
            </Match>
            <Match when={true}>
                <NiceP>
                    It looks like you don't have any channels yet. To get
                    started, receive some sats over lightning, or swap some
                    on-chain funds into a channel. Get your hands dirty!
                </NiceP>
            </Match>
        </Switch>
    );
}

export default function Channels() {
    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink href="/settings" title="Settings" />
                    <LargeHeader>Lightning Channels</LargeHeader>
                    <LiquidityMonitor />
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
