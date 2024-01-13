import { Check, Clock4, EyeOff, Globe, X, Zap } from "lucide-solid";
import { JSX, Match, Show, Switch } from "solid-js";

import { LabelCircle, LoadingSpinner } from "~/components";

export function GenericItem(props: {
    primaryAvatarUrl?: string;
    icon?: JSX.Element;
    secondaryAvatarUrl?: string;
    primaryName: string;
    secondaryName?: string;
    verb?: string;
    amount?: bigint;
    date?: string;
    due?: string;
    message?: string;
    accent?: "green";
    visibility?: "public" | "private";
    showFiat?: boolean;
    genericAvatar?: boolean;
    forceSecondary?: boolean;
    link?: string;
    primaryOnClick?: () => void;
    amountOnClick?: () => void;
    secondaryOnClick?: () => void;
    approveAction?: () => void;
    rejectAction?: () => void;
    shouldSpinny?: boolean;
}) {
    return (
        <div
            class="grid w-full py-3 first-of-type:pt-0"
            classList={{
                "grid-cols-[auto_1fr_auto]": true,
                "opacity-50": props.shouldSpinny
            }}
        >
            <div class="self-center">
                <Switch>
                    <Match when={props.icon}>
                        <button
                            class="flex h-[3rem] w-[3rem] items-center justify-center"
                            onClick={() => props.primaryOnClick}
                        >
                            {props.icon}
                        </button>
                    </Match>
                    <Match when={true}>
                        <LabelCircle
                            label={false}
                            name={props.primaryName}
                            contact
                            image_url={props.primaryAvatarUrl}
                            generic={props.genericAvatar}
                            onClick={props.primaryOnClick}
                        />
                    </Match>
                </Switch>
            </div>
            <div class="flex flex-col items-start justify-center gap-1 self-center px-2">
                {/* TITLE TEXT */}
                <Show when={props.primaryName && props.verb}>
                    <h2 class="text-sm">
                        <strong
                            classList={{
                                "text-m-grey-400": props.genericAvatar
                            }}
                        >
                            {props.primaryName}
                        </strong>
                        <span class="font-light">{` ${props.verb} `}</span>
                        <Show when={props.secondaryName}>
                            <strong>{props.secondaryName}</strong>
                        </Show>
                    </h2>
                </Show>
                <div class="flex flex-wrap gap-1">
                    {/* AMOUNT */}
                    <Show when={props.amount}>
                        <button
                            onClick={() =>
                                props.amountOnClick && props.amountOnClick()
                            }
                            class="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-white"
                            classList={{
                                "bg-m-grey-800": !props.accent,
                                "bg-m-green/40 ": props.accent === "green"
                            }}
                        >
                            {/* <img src={bolt} width={8} height={8} /> */}
                            <Zap class="w-3" fill="currentColor" />
                            {`${props.amount!.toLocaleString()} sats`}
                        </button>
                    </Show>
                    {/* FIAT AMOUNT */}
                    <Show when={props.showFiat}>
                        <div class="flex items-center gap-1 rounded-full py-1 text-xs font-semibold text-m-grey-400">
                            {`~$42.00 USD`}
                        </div>
                    </Show>
                    {/* OPTIONAL MESSAGE */}
                    <Show when={props.message}>
                        <div class="font-regular line-clamp-1 min-w-0 break-all rounded-full bg-m-grey-800 px-2 py-1 text-xs leading-6">
                            {props.message}
                        </div>
                    </Show>
                    {/* DUE */}
                    <Show when={props.due}>
                        <div class="flex w-full items-center gap-1 text-m-grey-400">
                            <Clock4 class="w-3" />
                            <span class="text-xs text-m-grey-400">
                                {props.due}
                            </span>
                        </div>
                    </Show>
                </div>
                {/* DATE WITH SECOND AVATAR */}
                <Show when={props.date}>
                    <div class="flex items-center gap-1 text-m-grey-400">
                        <Show when={props.visibility === "public"}>
                            {/* <img src={globe} width={12} height={12} /> */}
                            <Globe class="w-3" />
                        </Show>
                        <Show when={props.visibility === "private"}>
                            <EyeOff class="w-3" />
                            {/* <img src={privateEye} width={12} height={12} /> */}
                        </Show>
                        <Show when={props.link && props.date}>
                            <a
                                href={props.link}
                                class="text-xs text-m-grey-400"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {props.date}
                            </a>
                        </Show>
                        <Show when={!props.link && props.date}>
                            <span class="text-xs text-m-grey-400">
                                {props.date}
                            </span>
                        </Show>
                    </div>
                </Show>
            </div>
            <Show when={props.secondaryAvatarUrl || props.forceSecondary}>
                <div class="self-center">
                    <LabelCircle
                        label={false}
                        name={props.secondaryName}
                        contact
                        image_url={props.secondaryAvatarUrl}
                        onClick={props.secondaryOnClick}
                    />
                </div>
            </Show>
            <Show when={!props.secondaryAvatarUrl && !props.forceSecondary}>
                <div class="self-center">
                    {/* ACTIONS */}
                    <Show
                        when={
                            props.approveAction &&
                            props.rejectAction &&
                            !props.shouldSpinny
                        }
                    >
                        <div class="flex gap-4">
                            <button
                                class="flex h-10 w-10 items-center justify-center rounded bg-m-grey-800 p-1 text-m-green active:-mb-[1px] active:mt-[1px]"
                                onClick={() =>
                                    props.approveAction && props.approveAction()
                                }
                            >
                                <Check />
                            </button>
                            <button
                                class="flex h-10 w-10 items-center justify-center rounded bg-m-grey-800 p-1 text-m-red active:-mb-[1px] active:mt-[1px]"
                                onClick={() =>
                                    props.rejectAction && props.rejectAction()
                                }
                            >
                                <X />
                            </button>
                        </div>
                    </Show>
                    <Show when={props.shouldSpinny}>
                        <LoadingSpinner wide small />
                    </Show>
                </div>
            </Show>
        </div>
    );
}
