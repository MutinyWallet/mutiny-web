import { Match, Switch } from "solid-js";

import { AmountFiat, AmountSats } from "~/components/Amount";
import { useMegaStore } from "~/state/megaStore";

export function HomeBalance() {
    const [state, actions] = useMegaStore();

    const lightningPlusFedi = () =>
        (state.balance?.federation || 0n) + (state.balance?.lightning || 0n);

    // TODO: do some sort of status indicator
    // const fullyReady = () => state.load_stage === "done" && state.price !== 0;

    return (
        <button
            onClick={actions.cycleBalanceView}
            class="flex h-12 items-center justify-center rounded-lg border-b border-t border-b-white/10 border-t-white/40 bg-black px-4 py-2"
        >
            {/* <div class="w-2">
                <div
                    title={fullyReady() ? "READY" : "ALMOST"}
                    class="h-2 w-2 animate-throb rounded-full border-2"
                    classList={{
                        "border-m-green bg-m-green": fullyReady(),
                        "border-m-yellow bg-m-yellow": !fullyReady()
                    }}
                />
            </div> */}
            <h1 class="flex w-full justify-center whitespace-nowrap text-2xl font-light text-white">
                <Switch>
                    <Match when={state.balanceView === "sats"}>
                        <AmountSats
                            amountSats={lightningPlusFedi()}
                            icon="lightning"
                            denominationSize="lg"
                        />
                    </Match>
                    <Match when={state.balanceView === "fiat"}>
                        <AmountFiat
                            amountSats={lightningPlusFedi()}
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
