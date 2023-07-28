import { Match, ParentComponent, Show, Switch, createMemo } from "solid-js";
import { Card, VStack } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";
import { satsToUsd } from "~/utils/conversions";
import { AmountEditable } from "./AmountEditable";
import { useI18n } from "~/i18n/context";

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
    const i18n = useI18n();
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
            <span class="text-sm">
                {props.fiat ? i18n.t("common.usd") : i18n.t("common.sats")}
            </span>
        </div>
    );
};

function USDShower(props: { amountSats: string; fee?: string }) {
    const i18n = useI18n();
    const [state, _] = useMegaStore();
    const amountInUsd = () =>
        satsToUsd(state.price, add(props.amountSats, props.fee), true);

    return (
        <Show when={!(props.amountSats === "0")}>
            <KeyValue gray key="">
                <div class="self-end">
                    ~{amountInUsd()}&nbsp;
                    <span class="text-sm">{i18n.t("common.usd")}</span>
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
                            <KeyValue key={i18n.t("receive.amount")}>
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
                                        exitRoute={props.exitRoute}
                                        maxAmountSats={props.maxAmountSats}
                                        fee={props.fee}
                                    />
                                </Show>
                            </KeyValue>
                            <KeyValue gray key={i18n.t("receive.fee")}>
                                <InlineAmount amount={props.fee || "0"} />
                            </KeyValue>
                        </div>
                        <hr class="border-white/20" />
                        <div class="flex flex-col gap-1">
                            <KeyValue key={i18n.t("receive.total")}>
                                <InlineAmount amount={totalOrTotalLessFee()} />
                            </KeyValue>
                            <USDShower
                                amountSats={props.amountSats}
                                fee={props.fee}
                            />
                        </div>
                    </Match>
                    <Match when={props.reserve}>
                        <div class="flex flex-col gap-1">
                            <KeyValue key={i18n.t("receive.channel_size")}>
                                <InlineAmount
                                    amount={add(
                                        props.amountSats,
                                        props.reserve
                                    ).toString()}
                                />
                            </KeyValue>
                            <KeyValue
                                gray
                                key={i18n.t("receive.channel_reserve")}
                            >
                                <InlineAmount amount={props.reserve || "0"} />
                            </KeyValue>
                        </div>
                        <hr class="border-white/20" />
                        <div class="flex flex-col gap-1">
                            <KeyValue key={i18n.t("receive.spendable")}>
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
                            <KeyValue key={i18n.t("receive.amount")}>
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
                                        exitRoute={props.exitRoute}
                                        maxAmountSats={props.maxAmountSats}
                                        fee={props.fee}
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
