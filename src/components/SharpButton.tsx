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
            class="text-m-grey-300 flex items-center gap-2 rounded px-2 py-1 text-sm font-light md:text-base"
            classList={{
                "border-b border-t border-b-white/10 border-t-white/50 bg-m-grey-750 active:mt-[1px] active:-mb-[1px]":
                    !props.disabled
            }}
        >
            {props.children}
        </button>
    );
}
