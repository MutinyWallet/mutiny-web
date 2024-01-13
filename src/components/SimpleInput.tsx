import { JSX } from "solid-js";

type SimpleInputProps = {
    type?: "text" | "email" | "tel" | "password" | "url" | "date";
    placeholder?: string;
    value: string | undefined;
    disabled?: boolean;
    onInput: JSX.EventHandler<
        HTMLInputElement | HTMLTextAreaElement,
        InputEvent
    >;
};

export function SimpleInput(props: SimpleInputProps) {
    return (
        <input
            class="w-full rounded-lg bg-m-grey-800 p-2 placeholder-m-grey-400 disabled:text-m-grey-400"
            type="text"
            value={props.value}
            onInput={(e) => props.onInput(e)}
            placeholder={props.placeholder}
        />
    );
}
