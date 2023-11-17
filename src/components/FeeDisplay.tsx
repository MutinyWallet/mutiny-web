import { createMemo, ParentComponent, Show } from "solid-js";

import { VStack } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { satsToFormattedFiat } from "~/utils";

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
                <div class="self-end whitespace-nowrap">
                    {`${amountInFiat()} `}
                    <span class="text-sm">{state.fiat.value}</span>
                </div>
            </AmountKeyValue>
        </Show>
    );
}

const InlineAmount: ParentComponent<{
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

function add(a: string, b?: string) {
    return Number(a || 0) + Number(b || 0);
}

export function FeeDisplay(props: {
    amountSats: string;
    fee: string;
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
        <div class="w-[20rem] self-center">
            <VStack>
                <div class="flex flex-col gap-1">
                    <AmountKeyValue gray key={i18n.t("receive.fee")}>
                        <InlineAmount amount={props.fee || "0"} />
                    </AmountKeyValue>
                </div>
                <hr class="border-white/20" />
                <div class="flex flex-col gap-1">
                    <AmountKeyValue key={i18n.t("receive.total")}>
                        <InlineAmount amount={totalOrTotalLessFee()} />
                    </AmountKeyValue>
                    <USDShower amountSats={props.amountSats} fee={props.fee} />
                </div>
            </VStack>
        </div>
    );
}
