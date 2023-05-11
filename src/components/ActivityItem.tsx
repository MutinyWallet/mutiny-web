import { ParentComponent, createMemo, createResource } from "solid-js";
import { InlineAmount } from "./AmountCard";
import { satsToUsd } from "~/utils/conversions";
import bolt from "~/assets/icons/bolt.svg"
import chain from "~/assets/icons/chain.svg"
import { timeAgo } from "~/utils/prettyPrintTime";
import { MutinyTagItem } from "~/utils/tags";
import { generateGradient } from "~/utils/gradientHash";

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

function LabelCircle(props: { name?: string, contact: boolean }) {

    // TODO: don't need to run this if it's not a contact
    const [gradient] = createResource(props.name, async (name: string) => {
        return generateGradient(name || "?")
    })

    const text = () => (props.contact && props.name && props.name.length) ? props.name[0] : (props.name && props.name.length) ? "≡" : "?"
    const bg = () => (props.name && props.contact) ? gradient() : "gray"

    return (
        <div class="flex-none h-[3rem] w-[3rem] rounded-full flex items-center justify-center text-3xl uppercase border-t border-b border-t-white/50 border-b-white/10"
            style={{ background: bg() }}
        >
            {text()}
        </div>
    )
}

// function that takes a list of MutinyTagItems and returns bool if one of those items is of kind Contact
function includesContact(labels: MutinyTagItem[]) {
    return labels.some((label) => label.kind === "Contact")
}

// sort the labels so that the contact is always first
function sortLabels(labels: MutinyTagItem[]) {
    const contact = labels.find(label => label.kind === "Contact");
    return contact ? [contact, ...labels.filter(label => label !== contact)] : labels;
}

// return a string of each label name separated by a comma and a space. if the array is empty return "Unknown"
function labelString(labels: MutinyTagItem[]) {
    return labels.length ? labels.map(label => label.name).join(", ") : "Unknown"
}

export function ActivityItem(props: { kind: "lightning" | "onchain", labels: MutinyTagItem[], amount: number | bigint, date?: number | bigint, positive?: boolean, onClick?: () => void }) {
    const labels = () => sortLabels(props.labels)
    return (
        <div
            onClick={() => props.onClick && props.onClick()}
            class="grid grid-cols-[auto_minmax(0,_1fr)_minmax(0,_max-content)] pb-4 gap-4 border-b border-neutral-800 last:border-b-0"
            classList={{ "cursor-pointer": !!props.onClick }}
        >
            <div class="flex gap-2 md:gap-4 items-center">
                <div class="">
                    {props.kind === "lightning" ? <img class="w-[1rem]" src={bolt} alt="lightning" /> : <img class="w-[1rem]" src={chain} alt="onchain" />}
                </div>
                <div class="">
                    <LabelCircle name={labels().length ? labels()[0].name : ""} contact={includesContact(labels())} />
                </div>
            </div>
            <div class="flex flex-col">
                <span class="text-base font-semibold truncate" classList={{ "text-neutral-500": labels().length === 0 }}>{labelString(labels())}</span>
                <time class="text-sm text-neutral-500">{timeAgo(props.date)}</time>
            </div>
            <div class="">
                <ActivityAmount amount={props.amount.toString()} price={30000} positive={props.positive} />
            </div>
        </div>
    )
}