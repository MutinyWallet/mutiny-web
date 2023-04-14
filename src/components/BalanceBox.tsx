import { createResource, Show, Suspense } from "solid-js";
import { Button, ButtonLink, FancyCard } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";
import { Amount } from "./Amount";

function prettyPrintAmount(n?: number | bigint): string {
    if (!n || n.valueOf() === 0) {
        return "0"
    }
    return n.toLocaleString()
}

export default function BalanceBox() {
    const [state, _] = useMegaStore();

    const fetchBalance = async () => {
        console.log("Refetching balance");
        await state.node_manager?.sync();
        const balance = await state.node_manager?.get_balance();
        return balance
    };

    const [balance, { refetch: refetchBalance }] = createResource(fetchBalance);

    return (
        <>
            <FancyCard title="Lightning">
                <Suspense fallback={<Amount amountSats={0} showFiat loading={true} />}>
                    <Amount amountSats={balance()?.lightning} showFiat loading={balance.loading} />
                </Suspense>
            </FancyCard>
            <div class="flex gap-2 py-4">
                <ButtonLink href="/send" intent="green">Send</ButtonLink>
                <ButtonLink href="/receive" intent="blue">Receive</ButtonLink>
            </div>
            <FancyCard title="On-Chain">
                <Suspense fallback={<Amount amountSats={0} showFiat loading={true} />}>
                    <Amount amountSats={balance()?.confirmed} showFiat loading={balance.loading} />
                </Suspense>
                <Suspense>
                    <Show when={balance()?.unconfirmed}>
                        <div class="flex flex-col gap-2">
                            <header class='text-sm font-semibold uppercase text-white/50'>
                                Unconfirmed Balance
                            </header>
                            <div class="text-white/50">
                                {prettyPrintAmount(balance()?.unconfirmed)} <span class='text-sm'>SATS</span>
                            </div>
                        </div>
                    </Show>
                </Suspense>
                <Button onClick={() => refetchBalance()}>Sync</Button>
            </FancyCard>
        </>
    )
}
