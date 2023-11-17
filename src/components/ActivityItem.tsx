import { TagItem } from "@mutinywallet/mutiny-wasm";
import { Match, ParentComponent, Switch } from "solid-js";

import bolt from "~/assets/icons/bolt.svg";
import chain from "~/assets/icons/chain.svg";
import shuffle from "~/assets/icons/shuffle.svg";
import { AmountFiat, AmountSats, LabelCircle } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { timeAgo } from "~/utils";

export const ActivityAmount: ParentComponent<{
    amount: string;
    price: number;
    positive?: boolean;
    center?: boolean;
}> = (props) => {
    return (
        <div
            class="flex flex-col gap-1"
            classList={{
                "items-end": !props.center,
                "items-center": props.center
            }}
        >
            <div
                class="justify-end"
                classList={{ "text-m-green": props.positive }}
            >
                <AmountSats
                    amountSats={Number(props.amount)}
                    icon={props.positive ? "plus" : undefined}
                />
            </div>
            <div class="text-sm text-white/70">
                <AmountFiat
                    amountSats={Number(props.amount)}
                    denominationSize="sm"
                />
            </div>
        </div>
    );
};

export type HackActivityType =
    | "Lightning"
    | "OnChain"
    | "ChannelOpen"
    | "ChannelClose";

export function ActivityItem(props: {
    // This is actually the ActivityType enum but wasm is hard
    kind: HackActivityType;
    contacts: TagItem[];
    labels: string[];
    amount: number | bigint;
    date?: number | bigint;
    positive?: boolean;
    onClick?: () => void;
}) {
    const [state, _actions] = useMegaStore();
    const i18n = useI18n();

    const firstContact = () =>
        props.contacts?.length ? props.contacts[0] : null;

    // TODO: pass a value to the timeago function that will cause it to recalculate on sync

    return (
        <div
            onClick={() => props.onClick && props.onClick()}
            class="grid grid-cols-[auto_minmax(0,_1fr)_minmax(0,_max-content)] gap-4 border-b border-neutral-800 pb-4 last:border-b-0"
            classList={{ "cursor-pointer": !!props.onClick }}
        >
            <div class="flex items-center gap-2 md:gap-4">
                <div class="">
                    <Switch>
                        <Match when={props.kind === "Lightning"}>
                            <img class="w-[1rem]" src={bolt} alt="lightning" />
                        </Match>
                        <Match when={props.kind === "OnChain"}>
                            <img class="w-[1rem]" src={chain} alt="onchain" />
                        </Match>
                        <Match
                            when={
                                props.kind === "ChannelOpen" ||
                                props.kind === "ChannelClose"
                            }
                        >
                            <img class="w-[1rem]" src={shuffle} alt="swap" />
                        </Match>
                    </Switch>
                </div>
                <div class="">
                    <LabelCircle
                        name={firstContact()?.name}
                        image_url={firstContact()?.image_url}
                        contact={props.contacts?.length > 0}
                        label={props.labels?.length > 0}
                        channel={props.kind}
                    />
                </div>
            </div>
            <div class="flex flex-col">
                <Switch>
                    <Match when={props.kind === "ChannelClose"}>
                        <span class="text-base font-semibold text-neutral-500">
                            {i18n.t("activity.channel_close")}
                        </span>
                    </Match>
                    <Match when={props.kind === "ChannelOpen"}>
                        <span class="text-base font-semibold text-neutral-500">
                            {i18n.t("activity.channel_open")}
                        </span>{" "}
                    </Match>
                    <Match when={firstContact()?.name}>
                        <span class="truncate text-base font-semibold">
                            {firstContact()?.name}
                        </span>
                    </Match>
                    <Match when={props.labels.length > 0}>
                        <span class="truncate text-base font-semibold">
                            {props.labels[0]}
                        </span>
                    </Match>
                    <Match when={props.positive}>
                        <span class="text-base font-semibold text-neutral-500">
                            {i18n.t("activity.unknown")}
                        </span>
                    </Match>

                    <Match when={!props.positive}>
                        <span class="text-base font-semibold text-neutral-500">
                            {i18n.t("activity.unknown")}
                        </span>
                    </Match>
                </Switch>
                <Switch>
                    <Match when={props.date && props.date > 2147483647}>
                        <time class="text-sm text-m-yellow">
                            {i18n.t("common.pending")}
                        </time>
                    </Match>
                    <Match when={timeAgo(props.date) === "Pending"}>
                        <time class="text-sm text-m-yellow">
                            {i18n.t("common.pending")}
                        </time>
                    </Match>
                    <Match when={true}>
                        <time class="text-sm text-neutral-500">
                            {timeAgo(props.date)}
                        </time>
                    </Match>
                </Switch>
            </div>
            <div class="">
                <Switch>
                    <Match when={props.kind === "ChannelClose"}>
                        <div />
                    </Match>
                    <Match when={true}>
                        <ActivityAmount
                            amount={props.amount.toString()}
                            price={state.price}
                            positive={props.positive}
                        />
                    </Match>{" "}
                </Switch>
            </div>
        </div>
    );
}
