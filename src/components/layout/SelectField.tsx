import { Select as KSelect } from "@kobalte/core";
import { JSX, Show, splitProps } from "solid-js";

import check from "~/assets/icons/check.svg";
import upDown from "~/assets/icons/up-down.svg";

interface IOption {
    value: string;
    label: string;
}

type SelectProps = {
    options: IOption[];
    multiple?: boolean;
    size?: string | number;
    caption?: string;
    name: string;
    label?: string | undefined;
    placeholder?: string | undefined;
    value: string | undefined;
    error: string;
    required?: boolean | undefined;
    disabled?: boolean | undefined;
    ref: (element: HTMLSelectElement) => void;
    onInput: JSX.EventHandler<HTMLSelectElement, InputEvent>;
    onChange: JSX.EventHandler<HTMLSelectElement, Event>;
    onBlur: JSX.EventHandler<HTMLSelectElement, FocusEvent>;
};

export function SelectField(props: SelectProps) {
    // Split select element props
    const [rootProps, selectProps] = splitProps(
        props,
        ["name", "placeholder", "options", "required", "disabled"],
        ["placeholder", "ref", "onInput", "onChange", "onBlur"]
    );

    return (
        <div class="relative flex items-center">
            <KSelect.Root
                {...rootProps}
                class="flex w-full flex-col gap-2 text-sm font-semibold"
                optionValue="value"
                optionTextValue="label"
                sameWidth
                validationState={props.error ? "invalid" : "valid"}
                itemComponent={(props) => (
                    <KSelect.Item
                        item={props.item}
                        class="flex w-full justify-between rounded-lg p-1 hover:bg-m-grey-800"
                    >
                        <Show when={props.item.rawValue.label}>
                            <KSelect.ItemLabel>
                                {props.item.rawValue.label}
                            </KSelect.ItemLabel>
                        </Show>
                        <KSelect.ItemIndicator>
                            <img
                                src={check}
                                alt="check"
                                height={20}
                                width={20}
                            />
                        </KSelect.ItemIndicator>
                    </KSelect.Item>
                )}
            >
                <Show when={props.label}>
                    <KSelect.Label class="uppercase">
                        {props.label}
                    </KSelect.Label>
                </Show>
                <KSelect.HiddenSelect {...selectProps} />
                <KSelect.Trigger
                    class="flex w-full justify-between rounded-lg bg-m-grey-750 px-4 py-2 text-base font-normal text-white"
                    aria-label="selectField"
                >
                    <KSelect.Value<IOption>>
                        {(state) => state.selectedOption().label}
                    </KSelect.Value>
                    <KSelect.Icon class="ml-2 self-center">
                        <img src={upDown} alt="upDown" height={20} width={20} />
                    </KSelect.Icon>
                </KSelect.Trigger>
                <Show when={props.caption}>
                    <KSelect.Description class="text-sm font-normal text-neutral-400">
                        {props.caption}
                    </KSelect.Description>
                </Show>
                <KSelect.Portal>
                    <KSelect.Content>
                        <KSelect.Listbox class="w-full cursor-default rounded-lg bg-[#0a0a0a] p-2" />
                    </KSelect.Content>
                </KSelect.Portal>
                <KSelect.ErrorMessage class="text-m-red">
                    {props.error}
                </KSelect.ErrorMessage>
            </KSelect.Root>
        </div>
    );
}
