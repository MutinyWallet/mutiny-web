import { Match, ParentComponent, Switch, createMemo, createResource } from "solid-js";
import { satsToUsd } from "~/utils/conversions";
import bolt from "~/assets/icons/bolt.svg";
import chain from "~/assets/icons/chain.svg";
import shuffle from "~/assets/icons/shuffle.svg";
import { timeAgo } from "~/utils/prettyPrintTime";
import { generateGradient } from "~/utils/gradientHash";
import { useMegaStore } from "~/state/megaStore";
import { Contact } from "@mutinywallet/mutiny-wasm";

export const ActivityAmount: ParentComponent<{
  amount: string;
  price: number;
  positive?: boolean;
  center?: boolean;
}> = (props) => {
  const amountInUsd = createMemo(() => {
    const parsed = Number(props.amount);
    if (isNaN(parsed)) {
      return props.amount;
    } else {
      return satsToUsd(props.price, parsed, true);
    }
  });

  const prettyPrint = createMemo(() => {
    const parsed = Number(props.amount);
    if (isNaN(parsed)) {
      return props.amount;
    } else {
      return parsed.toLocaleString();
    }
  });

  return (
    <div
      class="flex flex-col"
      classList={{ "items-end": !props.center, "items-center": props.center }}
    >
      <div class="text-base" classList={{ "text-m-green": props.positive }}>
        {props.positive && "+ "}
        {prettyPrint()}&nbsp;<span class="text-sm">SATS</span>
      </div>
      <div class="text-sm text-neutral-500">
        &#8776;&nbsp;{amountInUsd()}&nbsp;<span class="text-sm">USD</span>
      </div>
    </div>
  );
};

function LabelCircle(props: { name?: string; contact: boolean; label: boolean }) {
  // TODO: don't need to run this if it's not a contact
  const [gradient] = createResource(async () => {
    return generateGradient(props.name || "?");
  });

  const text = () =>
    props.contact && props.name && props.name.length ? props.name[0] : props.label ? "≡" : "?";
  const bg = () => (props.name && props.contact ? gradient() : "gray");

  return (
    <div
      class="flex-none h-[3rem] w-[3rem] rounded-full flex items-center justify-center text-3xl uppercase border-t border-b border-t-white/50 border-b-white/10"
      style={{ background: bg() }}
    >
      {text()}
    </div>
  );
}

export type HackActivityType = "Lightning" | "OnChain" | "ChannelOpen";

export function ActivityItem(props: {
  // This is actually the ActivityType enum but wasm is hard
  kind: HackActivityType;
  contacts: Contact[];
  labels: string[];
  amount: number | bigint;
  date?: number | bigint;
  positive?: boolean;
  onClick?: () => void;
}) {
  const [state, _actions] = useMegaStore();

  const firstContact = () => (props.contacts?.length ? props.contacts[0] : null);

  return (
    <div
      onClick={() => props.onClick && props.onClick()}
      class="grid grid-cols-[auto_minmax(0,_1fr)_minmax(0,_max-content)] pb-4 gap-4 border-b border-neutral-800 last:border-b-0"
      classList={{ "cursor-pointer": !!props.onClick }}
    >
      <div class="flex gap-2 md:gap-4 items-center">
        <div class="">
          <Switch>
            <Match when={props.kind === "Lightning"}>
              <img class="w-[1rem]" src={bolt} alt="lightning" />
            </Match>
            <Match when={props.kind === "OnChain"}>
              <img class="w-[1rem]" src={chain} alt="onchain" />
            </Match>
            <Match when={props.kind === "ChannelOpen"}>
              <img class="w-[1rem]" src={shuffle} alt="swap" />
            </Match>
          </Switch>
        </div>
        <div class="">
          <LabelCircle
            name={firstContact()?.name}
            contact={props.contacts?.length > 0}
            label={props.labels?.length > 0}
          />
        </div>
      </div>
      <div class="flex flex-col">
        <Switch>
          <Match when={firstContact()?.name}>
            <span class="text-base font-semibold truncate">{firstContact()?.name}</span>
          </Match>
          <Match when={props.labels.length > 0}>
            <span class="text-base font-semibold truncate">{props.labels[0]}</span>
          </Match>
          <Match when={true}>
            <span class="text-base font-semibold text-neutral-500">Unknown</span>
          </Match>
        </Switch>
        <Switch>
          <Match when={props.date && props.date > 2147483647}>
            <time class="text-sm text-neutral-500">Pending</time>
          </Match>
          <Match when={true}>
            <time class="text-sm text-neutral-500">{timeAgo(props.date)}</time>
          </Match>
        </Switch>
      </div>
      <div class="">
        <ActivityAmount
          amount={props.amount.toString()}
          price={state.price}
          positive={props.positive}
        />
      </div>
    </div>
  );
}
