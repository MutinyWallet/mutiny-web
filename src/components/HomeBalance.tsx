import { Match, Switch } from "solid-js";

import { AmountFiat, AmountSats } from "~/components/Amount";
import { useMegaStore } from "~/state/megaStore";

export function HomeBalance() {
    const [state, actions] = useMegaStore();

    const combinedBalance = () =>
        (state.balance?.federation || 0n) +
        (state.balance?.lightning || 0n) +
        (state.balance?.confirmed || 0n) +
        (state.balance?.unconfirmed || 0n);

    // TODO: do some sort of status indicator
    // const fullyReady = () => state.load_stage === "done" && state.price !== 0;

    return (
        <button
            onClick={actions.cycleBalanceView}
            class="flex h-12 items-center justify-center rounded-lg border-b border-t border-b-white/10 border-t-white/40 bg-black px-4 py-2"
        >
            <h1 class="flex w-full justify-center whitespace-nowrap text-2xl font-light text-white">
                <Switch>
                    <Match when={state.balanceView === "sats"}>
                        <AmountSats
                            amountSats={combinedBalance()}
                            denominationSize="lg"
                        />
                    </Match>
                    <Match when={state.balanceView === "fiat"}>
                        <AmountFiat
                            amountSats={combinedBalance()}
                            denominationSize="lg"
                        />
                    </Match>
                    <Match when={state.balanceView === "hidden"}>
                        <div class="flex items-center gap-2">
                            <span>*****</span>
                        </div>
                    </Match>
                </Switch>
            </h1>
        </button>
    );
}
