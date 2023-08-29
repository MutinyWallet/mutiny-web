import { TextField as KTextField } from "@kobalte/core";
import { Show, splitProps, type JSX } from "solid-js";

import { TinyText } from "~/components";

export type TextFieldProps = {
    name: string;
    type?: "text" | "email" | "tel" | "password" | "url" | "date";
    label?: string;
    placeholder?: string;
    caption?: string;
    value: string | undefined;
    error: string;
    required?: boolean;
    multiline?: boolean;
    disabled?: boolean;
    ref: (element: HTMLInputElement | HTMLTextAreaElement) => void;
    onInput: JSX.EventHandler<
        HTMLInputElement | HTMLTextAreaElement,
        InputEvent
    >;
    onChange: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, Event>;
    onBlur: JSX.EventHandler<
        HTMLInputElement | HTMLTextAreaElement,
        FocusEvent
    >;
};

export function TextField(props: TextFieldProps) {
    const [fieldProps] = splitProps(props, [
        "placeholder",
        "ref",
        "onInput",
        "onChange",
        "onBlur"
    ]);
    return (
        <KTextField.Root
            class="flex flex-col gap-2"
            name={props.name}
            value={props.value}
            validationState={props.error ? "invalid" : "valid"}
            required={props.required}
            disabled={props.disabled}
        >
            <Show when={props.label}>
                <KTextField.Label class="text-sm font-semibold uppercase">
                    {props.label}
                </KTextField.Label>
            </Show>
            <Show
                when={props.multiline}
                fallback={
                    <KTextField.Input
                        {...fieldProps}
                        type={props.type}
                        class="w-full rounded-lg bg-white/10 p-2 placeholder-m-grey-400 disabled:text-m-grey-400"
                    />
                }
            >
                <KTextField.TextArea
                    {...fieldProps}
                    autoResize
                    class="w-full rounded-lg bg-white/10 p-2 placeholder-neutral-400"
                />
            </Show>
            <KTextField.ErrorMessage class="text-sm text-m-red">
                {props.error}
            </KTextField.ErrorMessage>
            <Show when={props.caption}>
                <TinyText>{props.caption}</TinyText>
            </Show>
        </KTextField.Root>
    );
}
