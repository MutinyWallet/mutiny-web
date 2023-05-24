import { Show, Suspense } from "solid-js";
import { Button, FancyCard, Indicator } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";
import { Amount } from "./Amount";
import { A, useNavigate } from "solid-start";
import shuffle from "~/assets/icons/shuffle.svg"

function prettyPrintAmount(n?: number | bigint): string {
    if (!n || n.valueOf() === 0) {
        return "0"
    }
    return n.toLocaleString()
}

export function LoadingShimmer() {
    return (<div class="flex flex-col gap-2 animate-pulse">
        <h1 class="text-4xl font-light">
            <div class="w-[12rem] rounded bg-neutral-700 h-[2.5rem]" />
        </h1>
        <h2 class="text-xl font-light text-white/70" >
            <div class="w-[8rem] rounded bg-neutral-700 h-[1.75rem]" />
        </h2>
    </div>)
}

const STYLE = "px-2 py-1 rounded-xl border border-neutral-400 text-sm flex gap-2 items-center font-semibold"

export default function BalanceBox(props: { loading?: boolean }) {
    const [state, _actions] = useMegaStore();

    const emptyBalance = () => (state.balance?.confirmed || 0n) === 0n && (state.balance?.lightning || 0n) === 0n

    const navigate = useNavigate()

    return (
        <>
            <FancyCard title="Lightning">
                <Show when={!props.loading} fallback={<LoadingShimmer />}>
                    <Amount amountSats={state.balance?.lightning || 0} showFiat />
                </Show>
            </FancyCard>

            <FancyCard title="On-Chain" tag={state.is_syncing && <Indicator>Syncing</Indicator>}>
                <Show when={!props.loading} fallback={<LoadingShimmer />}>
                    <div class="flex justify-between">
                        <Amount amountSats={state.balance?.confirmed} showFiat />
                        <div class="self-end justify-self-end">
                            <A href="/swap" class={STYLE}>
                                <img src={shuffle} alt="swap" class="h-8 w-8" />
                            </A>
                        </div>
                    </div>
                </Show>
                <Suspense>
                    <Show when={state.balance?.unconfirmed}>
                        <div class="flex flex-col gap-2">
                            <header class='text-sm font-semibold uppercase text-white/50'>
                                Unconfirmed Balance
                            </header>
                            <div class="text-white/50">
                                {prettyPrintAmount(state.balance?.unconfirmed)} <span class='text-sm'>SATS</span>
                            </div>
                        </div>
                    </Show>
                </Suspense>
            </FancyCard>
            <div class="flex gap-2 py-4">
                <Button onClick={() => navigate("/send")} disabled={emptyBalance() || props.loading} intent="green">Send</Button>
                <Button onClick={() => navigate("/receive")} disabled={props.loading} intent="blue">Receive</Button>
            </div>
        </>
    )
}
