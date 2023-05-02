import { RadioGroup as Kobalte } from '@kobalte/core';
import { type JSX, Show, splitProps, For } from 'solid-js';

type RadioGroupProps = {
    name: string;
    label?: string | undefined;
    options: { label: string; value: string }[];
    value: string | undefined;
    error: string;
    required?: boolean | undefined;
    disabled?: boolean | undefined;
    ref: (element: HTMLInputElement | HTMLTextAreaElement) => void;
    onInput: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, InputEvent>;
    onChange: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, Event>;
    onBlur: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, FocusEvent>;
};
type Color = "blue" | "green" | "red" | "gray"

const colorVariants = {
    blue: "bg-m-blue",
    green: "bg-m-green",
    red: "bg-m-red",
    gray: "bg-[#898989]",
}

export function ColorRadioGroup(props: RadioGroupProps) {
    const [rootProps, inputProps] = splitProps(
        props,
        ['name', 'value', 'required', 'disabled'],
        ['ref', 'onInput', 'onChange', 'onBlur']
    );
    return (
        <Kobalte.Root
            {...rootProps}
            validationState={props.error ? 'invalid' : 'valid'}
            class="flex flex-col gap-2"
        >
            <Show when={props.label}>
                <Kobalte.Label class="text-sm uppercase font-semibold">
                    {props.label}
                </Kobalte.Label>
            </Show>
            <div class="flex gap-2">
                <For each={props.options}>
                    {(option) => (
                        <Kobalte.Item value={option.value} class="ui-checked:bg-neutral-950 rounded outline outline-black/50 ui-checked:outline-white ui-checked:outline-2">
                            <Kobalte.ItemInput {...inputProps} />
                            <Kobalte.ItemControl class={`${colorVariants[option.value as Color]} w-8 h-8 rounded`}>
                                <Kobalte.ItemIndicator />
                            </Kobalte.ItemControl>
                            {/* <Kobalte.ItemLabel>{option.label}</Kobalte.ItemLabel> */}
                        </Kobalte.Item>
                    )}
                </For>
            </div>
            <Kobalte.ErrorMessage>{props.error}</Kobalte.ErrorMessage>
        </Kobalte.Root>
    );
}