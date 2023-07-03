import { TextField as KTextField } from "@kobalte/core";
import { type JSX, Show, splitProps } from "solid-js";
import { TinyText } from ".";

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
        >
            <Show when={props.label}>
                <KTextField.Label class="text-sm uppercase font-semibold">
                    {props.label}
                </KTextField.Label>
            </Show>
            <Show
                when={props.multiline}
                fallback={
                    <KTextField.Input
                        {...fieldProps}
                        type={props.type}
                        class="w-full p-2 rounded-lg bg-white/10 placeholder-neutral-400"
                    />
                }
            >
                <KTextField.TextArea
                    {...fieldProps}
                    autoResize
                    class="w-full p-2 rounded-lg bg-white/10 placeholder-neutral-400"
                />
            </Show>
            <KTextField.ErrorMessage class="text-m-red">
                {props.error}
            </KTextField.ErrorMessage>
            <Show when={props.caption}>
                <TinyText>{props.caption}</TinyText>
            </Show>
        </KTextField.Root>
    );
}
