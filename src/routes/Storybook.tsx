import { Match, Show, Switch } from "solid-js";
import { ActivityItem } from "~/components/ActivityItem";
import { Amount } from "~/components/Amount";
import { AmountCard } from "~/components/AmountCard";
import NavBar from "~/components/NavBar";
import { OnboardWarning } from "~/components/OnboardWarning";
import { ShareCard } from "~/components/ShareCard";
import { Card, DefaultMain, LargeHeader, SafeArea, SmallHeader, VStack } from "~/components/layout";
import { FullscreenModal } from "~/components/layout/FullscreenModal";
import mempoolTxUrl from "~/utils/mempoolTxUrl";
import megaex from "~/assets/icons/megaex.png";
import megacheck from "~/assets/icons/megacheck.png";

const SAMPLE =
  "bitcoin:tb1prqm8xtlgme0vmw5s30lgf0a4f5g4mkgsqundwmpu6thrg8zr6uvq2qrhzq?amount=0.001&lightning=lntbs1m1pj9n9xjsp5xgdrmvprtm67p7nq4neparalexlhlmtxx87zx6xeqthsplu842zspp546d6zd2seyaxpapaxx62m88yz3xueqtjmn9v6wj8y56np8weqsxqdqqnp4qdn2hj8tfknpuvdg6tz9yrf3e27ltrx9y58c24jh89lnm43yjwfc5xqrpwjcqpj9qrsgq5sdgh0m3ur5mu5hrmmag4mx9yvy86f83pd0x9ww80kgck6tac3thuzkj0mrtltaxwnlfea95h2re7tj4qsnwzxlvrdmyq2h9mgapnycpppz6k6";
export default function Admin() {
  const channelOpenResult = () => {
    return {
      channel: {
        balance: 100000n,
        reserve: 1000n,
        outpoint: "123:0"
      },
      failure_reason: undefined
    };
  };

  const setChannelOpenResult = (result: any) => {};

  return (
    <SafeArea>
      <DefaultMain>
        <LargeHeader>Storybook</LargeHeader>
        <OnboardWarning />
        <VStack>
          <AmountCard amountSats={"100000"} fee={"69"} />
          <ShareCard text={SAMPLE} />
          {/* <Card title="Activity">
                        <ActivityItem kind="lightning" labels={["benthecarman"]} amount={100000} date={1683664966} />
                        <ActivityItem kind="onchain" labels={["tony"]} amount={42000000} positive date={1683664966} />
                        <ActivityItem kind="onchain" labels={["a fake name thati is too long"]} amount={42000000} date={1683664966} />
                        <ActivityItem kind="onchain" labels={["a fake name thati is too long"]} amount={42000000} date={1683664966} />
                    </Card> */}
          <FullscreenModal
            title={channelOpenResult()?.channel ? "Channel Opened" : "Channel Open Failed"}
            confirmText={channelOpenResult()?.channel ? "Nice" : "Too Bad"}
            open={!!channelOpenResult()}
            setOpen={(open: boolean) => {
              if (!open) setChannelOpenResult(undefined);
            }}
            onConfirm={() => {
              setChannelOpenResult(undefined);
              //   navigate("/");
            }}
          >
            <div class="flex flex-col items-center gap-8 pb-8">
              <Switch>
                <Match when={channelOpenResult()?.failure_reason}>
                  <img src={megaex} alt="fail" class="w-1/2 mx-auto max-w-[30vh] flex-shrink" />

                  <p class="text-xl font-light py-2 px-4 rounded-xl bg-white/10">
                    {channelOpenResult()?.failure_reason?.message}
                  </p>
                </Match>
                <Match when={true}>
                  <img
                    src={megacheck}
                    alt="success"
                    class="w-1/2 mx-auto max-w-[30vh] flex-shrink"
                  />
                  <AmountCard
                    amountSats={channelOpenResult()?.channel?.balance.toString()}
                    reserve={"1000"}
                  />
                  <Show when={channelOpenResult()?.channel?.outpoint}>
                    <a
                      class=""
                      href={mempoolTxUrl(
                        channelOpenResult()?.channel?.outpoint?.split(":")[0],
                        "signet"
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Mempool Link
                    </a>
                  </Show>
                  {/* <pre>{JSON.stringify(channelOpenResult()?.channel?.value, null, 2)}</pre> */}
                </Match>
              </Switch>
            </div>
          </FullscreenModal>
        </VStack>
      </DefaultMain>
      <NavBar activeTab="none" />
    </SafeArea>
  );
}
