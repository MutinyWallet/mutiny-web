import { Show } from "solid-js";
import { Button, FancyCard, Indicator } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";
import { Amount } from "./Amount";
import { A, useNavigate } from "solid-start";
import shuffle from "~/assets/icons/shuffle.svg";

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
  "px-2 py-1 rounded-xl border border-neutral-400 text-sm flex gap-2 items-center font-semibold";

export default function BalanceBox(props: { loading?: boolean }) {
  const [state, _actions] = useMegaStore();

  const emptyBalance = () =>
    (state.balance?.confirmed || 0n) === 0n &&
    (state.balance?.lightning || 0n) === 0n &&
    (state.balance?.unconfirmed || 0n) === 0n;

  const navigate = useNavigate();

  const totalOnchain = () => (state.balance?.confirmed || 0n) + (state.balance?.unconfirmed || 0n);

  return (
    <>
      <FancyCard title="Lightning">
        <Show when={!props.loading} fallback={<LoadingShimmer />}>
          <Amount amountSats={state.balance?.lightning || 0} showFiat />
        </Show>
      </FancyCard>

      <FancyCard
        title="On-Chain"
        subtitle={state.balance?.unconfirmed ? "Unconfirmed" : undefined}
        tag={state.is_syncing && <Indicator>Syncing</Indicator>}
      >
        <Show when={!props.loading} fallback={<LoadingShimmer />}>
          <div class="flex justify-between">
            <Amount amountSats={totalOnchain()} showFiat />
            <Show when={!emptyBalance()}>
              <div class="self-end justify-self-end">
                <A href="/swap" class={STYLE}>
                  <img src={shuffle} alt="swap" class="h-8 w-8" />
                </A>
              </div>
            </Show>
          </div>
        </Show>
      </FancyCard>
      <div class="flex gap-2 py-4">
        <Button
          onClick={() => navigate("/send")}
          disabled={emptyBalance() || props.loading}
          intent="green"
        >
          Send
        </Button>
        <Button onClick={() => navigate("/receive")} disabled={props.loading} intent="blue">
          Receive
        </Button>
      </div>
    </>
  );
}
