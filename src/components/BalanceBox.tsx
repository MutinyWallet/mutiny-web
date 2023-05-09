import { Show, Suspense } from "solid-js";
import { ButtonLink, FancyCard, Indicator } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";
import { Amount } from "./Amount";

function prettyPrintAmount(n?: number | bigint): string {
    if (!n || n.valueOf() === 0) {
        return "0"
    }
    return n.toLocaleString()
}

export default function BalanceBox() {
    const [state, actions] = useMegaStore();

    return (
        <>
            <FancyCard title="Lightning">
                <Amount amountSats={state.balance?.lightning || 0} showFiat />
            </FancyCard>

            <FancyCard title="On-Chain" tag={state.is_syncing && <Indicator>Syncing</Indicator>}>
                <div onClick={actions.sync}>
                    <Amount amountSats={state.balance?.confirmed} showFiat />
                </div>
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
                <ButtonLink href="/send" intent="green">Send</ButtonLink>
                <ButtonLink href="/receive" intent="blue">Receive</ButtonLink>
            </div>
        </>
    )
}
