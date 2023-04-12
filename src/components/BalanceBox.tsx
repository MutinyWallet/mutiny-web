import { Motion, Presence } from "@motionone/solid";
import { createResource, Show, Suspense } from "solid-js";

import { ButtonLink } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";

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
        <Presence>
            <Motion
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, easing: [0.87, 0, 0.13, 1] }}
            >
                <div class='border border-white rounded-xl border-b-4 p-4 flex flex-col gap-2'>
                    <header class='text-sm font-semibold uppercase'>
                        Balance
                    </header>
                    <div onClick={refetchBalance}>
                        <h1 class='text-4xl font-light'>
                            <Suspense fallback={"..."}>
                                <Show when={balance()}>
                                    <div class="flex flex-col gap-4">
                                        <div>
                                            {prettyPrintAmount(balance()?.confirmed)} <span class='text-xl'>SAT</span>
                                        </div>
                                        <Show when={balance()?.unconfirmed}>
                                            <div class="flex flex-col gap-2">
                                                <header class='text-sm font-semibold uppercase text-white/50'>
                                                    Unconfirmed Balance
                                                </header>
                                                <div class="text-white/50">
                                                    {prettyPrintAmount(balance()?.unconfirmed)} <span class='text-xl'>SAT</span>
                                                </div>
                                            </div>
                                        </Show>
                                    </div>
                                </Show>
                            </Suspense>
                        </h1>
                    </div>
                    <div class="flex gap-2 py-4">
                        <ButtonLink href="/send" intent="green">Send</ButtonLink>
                        <ButtonLink href="/receive" intent="blue">Receive</ButtonLink>
                    </div>
                </div>
            </Motion>
        </Presence>
    )
}
