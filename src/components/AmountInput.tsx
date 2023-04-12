import { TextField } from "@kobalte/core";
import { Match, Suspense, Switch, createEffect, createMemo, createResource, createSignal } from "solid-js";
import { useMegaStore } from "~/state/megaStore";
import { satsToUsd, usdToSats } from "~/utils/conversions";

export type AmountInputProps = {
    initialAmountSats: string;
    setAmountSats: (amount: string) => void;
    refSetter: (el: HTMLInputElement) => void;
}

type ActiveCurrency = "usd" | "sats"

export function AmountInput(props: AmountInputProps) {
    // We need to keep a local amount state because we need to convert between sats and USD
    // But we should keep the parent state in sats
    const [localAmount, setLocalAmount] = createSignal(props.initialAmountSats || "0");

    const [state, _] = useMegaStore()

    async function getPrice() {
        return await state.node_manager?.get_bitcoin_price()
    }

    const [activeCurrency, setActiveCurrency] = createSignal<ActiveCurrency>("sats")

    const [price] = createResource(getPrice)

    const amountInUsd = createMemo(() => satsToUsd(price(), parseInt(localAmount()) || 0, true))
    const amountInSats = createMemo(() => usdToSats(price(), parseFloat(localAmount() || "0.00") || 0, true))

    createEffect(() => {
        // When the local amount changes, update the parent state if we're in sats
        if (activeCurrency() === "sats") {
            props.setAmountSats(localAmount())
        } else {
            // If we're in USD, convert the amount to sats
            props.setAmountSats(usdToSats(price(), parseFloat(localAmount() || "0.00") || 0, false))
        }
    })

    function toggleActiveCurrency() {
        if (activeCurrency() === "sats") {
            setActiveCurrency("usd")
            // Convert the current amount of sats to USD
            const usd = satsToUsd(price() || 0, parseInt(localAmount()) || 0, false)
            console.log(`converted ${localAmount()} sats to ${usd} USD`)
            setLocalAmount(usd);
        } else {
            setActiveCurrency("sats")
            // Convert the current amount of USD to sats 
            const sats = usdToSats(price() || 0, parseInt(localAmount()) || 0, false)
            console.log(`converted ${localAmount()} usd to ${sats} sats`)
            setLocalAmount(sats)
        }
    }

    return (
        <div class="">
            <TextField.Root
                value={localAmount()}
                onValueChange={setLocalAmount}
                class="flex flex-col gap-2"
            >
                <pre>{`Bitcoin is ${price()?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}`}</pre>
                <TextField.Label class="text-sm font-semibold uppercase" >Amount {activeCurrency() === "sats" ? "(sats)" : "(USD)"}</TextField.Label>
                <TextField.Input autofocus ref={(el) => props.refSetter(el)} inputmode={"decimal"} class="w-full p-2 rounded-lg text-black" />
                <Suspense>
                    <Switch fallback={<div>Loading...</div>}>
                        <Match when={price() && activeCurrency() === "sats"}>
                            <pre>{`~${amountInUsd()}`}</pre>
                        </Match>
                        <Match when={price() && activeCurrency() === "usd"}>
                            <pre>{`${amountInSats()} sats`}</pre>
                        </Match>
                    </Switch>
                </Suspense>
            </TextField.Root>
            <button type="button" onClick={toggleActiveCurrency}>&#x1F500;</button>
        </div>
    )
}