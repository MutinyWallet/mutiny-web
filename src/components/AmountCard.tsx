import { Match, ParentComponent, Show, Switch, createMemo } from "solid-js";
import { Card, VStack } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";
import { satsToUsd } from "~/utils/conversions";
import { AmountEditable } from "./AmountEditable";

const noop = () => {
    // do nothing
};

const KeyValue: ParentComponent<{ key: string; gray?: boolean }> = (props) => {
    return (
        <div
            class="flex justify-between items-center"
            classList={{ "text-neutral-400": props.gray }}
        >
            <div class="font-semibold uppercase">{props.key}</div>
            <div class="font-light">{props.children}</div>
        </div>
    );
};

export const InlineAmount: ParentComponent<{
    amount: string;
    sign?: string;
    fiat?: boolean;
}> = (props) => {
    const prettyPrint = createMemo(() => {
        const parsed = Number(props.amount);
        if (isNaN(parsed)) {
            return props.amount;
        } else {
            return parsed.toLocaleString();
        }
    });

    return (
        <div class="inline-block text-lg">
            {props.sign ? `${props.sign} ` : ""}
            {props.fiat ? "$" : ""}
            {prettyPrint()}{" "}
            <span class="text-sm">{props.fiat ? "USD" : "SATS"}</span>
        </div>
    );
};

function USDShower(props: { amountSats: string; fee?: string }) {
    const [state, _] = useMegaStore();
    const amountInUsd = () =>
        satsToUsd(state.price, add(props.amountSats, props.fee), true);

    return (
        <Show when={!(props.amountSats === "0")}>
            <KeyValue gray key="">
                <div class="self-end">
                    &#8776; {amountInUsd()}&nbsp;
                    <span class="text-sm">USD</span>
                </div>
            </KeyValue>
        </Show>
    );
}

function add(a: string, b?: string) {
    return Number(a || 0) + Number(b || 0);
}

export function AmountCard(props: {
    amountSats: string;
    fee?: string;
    reserve?: string;
    initialOpen?: boolean;
    isAmountEditable?: boolean;
    setAmountSats?: (amount: bigint) => void;
    skipWarnings?: boolean;
}) {
    return (
        <Card>
            <VStack>
                <Switch>
                    <Match when={props.fee}>
                        <div class="flex flex-col gap-1">
                            <KeyValue key="Amount">
                                <Show
                                    when={props.isAmountEditable}
                                    fallback={
                                        <InlineAmount
                                            amount={props.amountSats}
                                        />
                                    }
                                >
                                    <AmountEditable
                                        initialOpen={props.initialOpen ?? false}
                                        initialAmountSats={props.amountSats.toString()}
                                        setAmountSats={
                                            props.setAmountSats
                                                ? props.setAmountSats
                                                : noop
                                        }
                                        skipWarnings={props.skipWarnings}
                                    />
                                </Show>
                            </KeyValue>
                            <KeyValue gray key="+ Fee">
                                <InlineAmount amount={props.fee || "0"} />
                            </KeyValue>
                        </div>
                        <hr class="border-white/20" />
                        <div class="flex flex-col gap-1">
                            <KeyValue key="Total">
                                <InlineAmount
                                    amount={add(
                                        props.amountSats,
                                        props.fee
                                    ).toString()}
                                />
                            </KeyValue>
                            <USDShower
                                amountSats={props.amountSats}
                                fee={props.fee}
                            />
                        </div>
                    </Match>
                    <Match when={props.reserve}>
                        <div class="flex flex-col gap-1">
                            <KeyValue key="Channel size">
                                <InlineAmount
                                    amount={add(
                                        props.amountSats,
                                        props.reserve
                                    ).toString()}
                                />
                            </KeyValue>
                            <KeyValue gray key="- Channel Reserve">
                                <InlineAmount amount={props.reserve || "0"} />
                            </KeyValue>
                        </div>
                        <hr class="border-white/20" />
                        <div class="flex flex-col gap-1">
                            <KeyValue key="Spendable">
                                <InlineAmount amount={props.amountSats} />
                            </KeyValue>
                            <USDShower
                                amountSats={props.amountSats}
                                fee={props.reserve}
                            />
                        </div>
                    </Match>
                    <Match when={!props.fee && !props.reserve}>
                        <div class="flex flex-col gap-1">
                            <KeyValue key="Amount">
                                <Show
                                    when={props.isAmountEditable}
                                    fallback={
                                        <InlineAmount
                                            amount={props.amountSats}
                                        />
                                    }
                                >
                                    <AmountEditable
                                        initialOpen={props.initialOpen ?? false}
                                        initialAmountSats={props.amountSats.toString()}
                                        setAmountSats={
                                            props.setAmountSats
                                                ? props.setAmountSats
                                                : noop
                                        }
                                        skipWarnings={props.skipWarnings}
                                    />
                                </Show>
                            </KeyValue>
                            <USDShower amountSats={props.amountSats} />
                        </div>
                    </Match>
                </Switch>
            </VStack>
        </Card>
    );
}
