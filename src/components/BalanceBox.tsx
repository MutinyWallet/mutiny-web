import { createResource, Show, Suspense } from "solid-js";
import { ButtonLink, FancyCard } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";
import { Amount } from "./Amount";

function prettyPrintAmount(n?: number | bigint): string {
    if (!n || n.valueOf() === 0) {
        return "0"
    }
    return n.toLocaleString()
}

function SyncingIndicator() {
    return (
        <div class="box-border animate-pulse px-2 py-1 -my-1 bg-white/70 rounded text-xs uppercase text-black">Syncing</div>
    )
}

export default function BalanceBox() {
    const [state, _] = useMegaStore();

    const fetchOnchainBalance = async () => {
        console.log("Refetching onchain balance");
        await state.node_manager?.sync();
        const balance = await state.node_manager?.get_balance();
        return balance
    };

    // TODO: it's hacky to do these separately, but ln doesn't need the sync so I don't want to wait
    const fetchLnBalance = async () => {
        console.log("Refetching ln balance");
        const balance = await state.node_manager?.get_balance();
        return balance
    };

    const [onChainBalance, { refetch: refetchOnChainBalance }] = createResource(fetchOnchainBalance);
    const [lnBalance, { refetch: refetchLnBalance }] = createResource(fetchLnBalance);

    function refetchBalance() {
        refetchLnBalance();
        refetchOnChainBalance();
    }

    return (
        <>
            <FancyCard title="Lightning">
                <Suspense fallback={<Amount amountSats={0} showFiat loading={true} />}>
                    <Show when={lnBalance()}>
                        <Amount amountSats={lnBalance()?.lightning} showFiat />
                    </Show>
                </Suspense>
            </FancyCard>

            <FancyCard title="On-Chain" tag={onChainBalance.loading && <SyncingIndicator />}>
                <Suspense fallback={<Amount amountSats={0} showFiat loading={true} />}>
                    <div onClick={refetchBalance}>
                        <Amount amountSats={onChainBalance()?.confirmed} showFiat loading={onChainBalance.loading} />
                    </div>
                </Suspense>
                <Suspense>
                    <Show when={onChainBalance()?.unconfirmed}>
                        <div class="flex flex-col gap-2">
                            <header class='text-sm font-semibold uppercase text-white/50'>
                                Unconfirmed Balance
                            </header>
                            <div class="text-white/50">
                                {prettyPrintAmount(onChainBalance()?.unconfirmed)} <span class='text-sm'>SATS</span>
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
