import { JSX } from "solid-js";

export function SharpButton(props: {
    onClick: () => void;
    children: JSX.Element;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={() => props.onClick()}
            disabled={props.disabled}
            class="flex gap-2 rounded px-2 py-1 text-sm font-light text-m-grey-400 md:text-base"
            classList={{
                "border-b border-t border-b-white/10 border-t-white/50 bg-neutral-700":
                    !props.disabled
            }}
        >
            {props.children}
        </button>
    );
}
