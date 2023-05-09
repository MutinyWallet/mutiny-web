import { ParentComponent, createMemo } from "solid-js";
import { InlineAmount } from "./AmountCard";
import { satsToUsd } from "~/utils/conversions";
import bolt from "~/assets/icons/bolt.svg"
import chain from "~/assets/icons/chain.svg"
import { timeAgo } from "~/utils/prettyPrintTime";

export const ActivityAmount: ParentComponent<{ amount: string, price: number, positive?: boolean }> = (props) => {
    const amountInUsd = createMemo(() => {
        const parsed = Number(props.amount);
        if (isNaN(parsed)) {
            return props.amount;
        } else {
            return satsToUsd(props.price, parsed, true);
        }
    })

    const prettyPrint = createMemo(() => {
        const parsed = Number(props.amount);
        if (isNaN(parsed)) {
            return props.amount;
        } else {
            return parsed.toLocaleString();
        }
    })

    return (
        <div class="flex flex-col items-end">
            <div class="text-base"
                classList={{ "text-m-green": props.positive }}
            >{props.positive && "+ "}{prettyPrint()}&nbsp;<span class="text-sm">SATS</span>
            </div>
            <div class="text-sm text-neutral-500">&#8776;&nbsp;{amountInUsd()}&nbsp;<span class="text-sm">USD</span></div>
        </div>
    )
}

function LabelCircle(props: { name: string }) {
    return (
        <div class="flex-none h-[3rem] w-[3rem] rounded-full flex items-center justify-center text-3xl uppercase border-t border-b border-t-white/50 border-b-white/10"
            style={{ background: "gray" }}
        >
            {props.name[0] || "?"}
        </div>
    )
}

export function ActivityItem(props: { kind: "lightning" | "onchain", labels: string[], amount: number | bigint, date?: number | bigint, positive?: boolean, onClick?: () => void }) {
    return (
        <div
            onClick={() => props.onClick && props.onClick()}
            class="grid grid-cols-[auto_minmax(0,_1fr)_minmax(0,_max-content)] pb-4 gap-4 border-b border-neutral-800 last:border-b-0"
            classList={{ "cursor-pointer": !!props.onClick }}
        >
            <div class="flex gap-2 md:gap-4 items-center">
                <div class="">
                    {props.kind === "lightning" ? <img src={bolt} alt="lightning" /> : <img src={chain} alt="onchain" />}
                </div>
                <div class="">
                    <LabelCircle name={props.labels.length ? props.labels[0] : "?"} />
                </div>
            </div>
            <div class="flex flex-col">
                <span class="text-base font-semibold truncate" classList={{ "text-neutral-500": props.labels.length === 0 }}>{props.labels.length ? props.labels[0] : "Unknown"}</span>
                <time class="text-sm text-neutral-500">{timeAgo(props.date)}</time>
            </div>
            <div class="">
                <ActivityAmount amount={props.amount.toString()} price={30000} positive={props.positive} />
            </div>
        </div>
    )
}