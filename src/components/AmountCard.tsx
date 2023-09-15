import { createMemo, Match, ParentComponent, Show, Switch } from "solid-js";

import { AmountEditable, Card, VStack } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { satsToFormattedFiat } from "~/utils";

const noop = () => {
    // do nothing
};

const AmountKeyValue: ParentComponent<{ key: string; gray?: boolean }> = (
    props
) => {
    return (
        <div
            class="flex items-center justify-between"
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
}> = (props) => {
    const i18n = useI18n();
    const prettyPrint = createMemo(() => {
        const parsed = Number(props.amount);
        if (isNaN(parsed)) {
            return props.amount;
        } else {
            return parsed.toLocaleString(navigator.languages[0]);
        }
    });

    return (
        <div class="inline-block text-lg">
            {props.sign ? `${props.sign} ` : ""}
            {prettyPrint()} <span class="text-sm">{i18n.t("common.sats")}</span>
        </div>
    );
};

function USDShower(props: { amountSats: string; fee?: string }) {
    const [state, _] = useMegaStore();
    const amountInFiat = () =>
        (state.fiat.value === "BTC" ? "" : "~") +
        satsToFormattedFiat(
            state.price,
            add(props.amountSats, props.fee),
            state.fiat
        );

    return (
        <Show when={!(props.amountSats === "0")}>
            <AmountKeyValue gray key="">
                <div class="self-end">
                    {amountInFiat()}&nbsp;
                    <span class="text-sm">{state.fiat.value}</span>
                </div>
            </AmountKeyValue>
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
    showWarnings?: boolean;
    exitRoute?: string;
    maxAmountSats?: bigint;
}) {
    const i18n = useI18n();
    // Normally we want to add the fee to the amount, but for max amount we just show the max
    const totalOrTotalLessFee = () => {
        if (
            props.fee &&
            props.maxAmountSats &&
            props.amountSats === props.maxAmountSats?.toString()
        ) {
            return props.maxAmountSats.toLocaleString();
        } else {
            return add(props.amountSats, props.fee).toString();
        }
    };
    return (
        <Card>
            <VStack>
                <Switch>
                    <Match when={props.fee}>
                        <div class="flex flex-col gap-1">
                            <AmountKeyValue key={i18n.t("receive.amount")}>
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
                                        showWarnings={
                                            props.showWarnings ?? false
                                        }
                                        exitRoute={props.exitRoute}
                                        maxAmountSats={props.maxAmountSats}
                                        fee={props.fee}
                                    />
                                </Show>
                            </AmountKeyValue>
                            <AmountKeyValue gray key={i18n.t("receive.fee")}>
                                <InlineAmount amount={props.fee || "0"} />
                            </AmountKeyValue>
                        </div>
                        <hr class="border-white/20" />
                        <div class="flex flex-col gap-1">
                            <AmountKeyValue key={i18n.t("receive.total")}>
                                <InlineAmount amount={totalOrTotalLessFee()} />
                            </AmountKeyValue>
                            <USDShower
                                amountSats={props.amountSats}
                                fee={props.fee}
                            />
                        </div>
                    </Match>
                    <Match when={props.reserve}>
                        <div class="flex flex-col gap-1">
                            <AmountKeyValue
                                key={i18n.t("receive.channel_size")}
                            >
                                <InlineAmount
                                    amount={add(
                                        props.amountSats,
                                        props.reserve
                                    ).toString()}
                                />
                            </AmountKeyValue>
                            <AmountKeyValue
                                gray
                                key={i18n.t("receive.channel_reserve")}
                            >
                                <InlineAmount amount={props.reserve || "0"} />
                            </AmountKeyValue>
                        </div>
                        <hr class="border-white/20" />
                        <div class="flex flex-col gap-1">
                            <AmountKeyValue key={i18n.t("receive.spendable")}>
                                <InlineAmount amount={props.amountSats} />
                            </AmountKeyValue>
                            <USDShower
                                amountSats={props.amountSats}
                                fee={props.reserve}
                            />
                        </div>
                    </Match>
                    <Match when={!props.fee && !props.reserve}>
                        <div class="flex flex-col gap-1">
                            <AmountKeyValue key={i18n.t("receive.amount")}>
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
                                        showWarnings={
                                            props.showWarnings ?? false
                                        }
                                        exitRoute={props.exitRoute}
                                        maxAmountSats={props.maxAmountSats}
                                        fee={props.fee}
                                    />
                                </Show>
                            </AmountKeyValue>
                            <USDShower amountSats={props.amountSats} />
                        </div>
                    </Match>
                </Switch>
            </VStack>
        </Card>
    );
}
