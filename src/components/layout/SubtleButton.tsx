import { JSX, Show } from "solid-js";

import { LoadingSpinner } from "./LoadingSpinner";

export function SubtleButton(props: {
    children: JSX.Element | string;
    onClick?: () => void;
    loading?: boolean;
    disabled?: boolean;
    intent?: "red" | "green" | "blue";
    type?: "button" | "submit";
}) {
    return (
        <button
            type={props.type || "button"}
            onClick={() => props.onClick && props.onClick()}
            disabled={props.loading || props.disabled}
            class="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-900 p-2  no-underline active:-mb-[1px] active:mt-[1px] active:opacity-70"
            classList={{
                "text-m-grey-350": !props.intent,
                "text-m-red": props.intent === "red",
                "text-m-green": props.intent === "green",
                "text-m-blue": props.intent === "blue"
            }}
        >
            <Show when={props.loading}>
                {/* Loading spinner has a weird padding on it */}
                <div class="-my-1 -mr-2">
                    <LoadingSpinner smallest wide />
                </div>
            </Show>
            <Show when={!props.loading}>{props.children}</Show>
        </button>
    );
}
