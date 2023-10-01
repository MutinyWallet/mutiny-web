import { RadioGroup } from "@kobalte/core";
import { createSignal, For, Show } from "solid-js";

import { timeout } from "~/utils";

type Choices = {
    value: string;
    label: string;
    caption: string;
    disabled?: boolean;
}[];

// TODO: how could would it be if we could just pass the estimated fees in here?
export function StyledRadioGroup(props: {
    initialValue: string;
    choices: Choices;
    onValueChange: (value: string) => void;
    small?: boolean;
    accent?: "red" | "white";
    vertical?: boolean;
    delayOnChange?: boolean;
}) {
    const [value, setValue] = createSignal(props.initialValue);

    async function onChange(value: string) {
        setValue(value);

        // This is so if the modal is going to be closed after value change, it will show the choice briefly first
        if (props.delayOnChange) {
            await timeout(200);
            props.onValueChange(value);
        } else {
            props.onValueChange(value);
        }
    }
    return (
        <RadioGroup.Root
            value={value()}
            onChange={onChange}
            class={"w-full gap-4"}
            classList={{
                "flex flex-col": props.vertical,
                "grid grid-cols-2":
                    props.choices.length === 2 && !props.vertical,
                "grid grid-cols-3":
                    props.choices.length === 3 && !props.vertical,
                "gap-2": props.small
            }}
        >
            <For each={props.choices}>
                {(choice) => (
                    <RadioGroup.Item
                        value={choice.value}
                        class={`rounded-lg bg-m-grey-700 ui-checked:outline`}
                        classList={{
                            "ui-checked:outline-m-red": props.accent === "red",
                            "ui-checked:outline-white":
                                props.accent === "white",
                            "ui-disabled:opacity-50": choice.disabled
                        }}
                        disabled={choice.disabled}
                    >
                        <div class={"flex items-center"}>
                            <RadioGroup.ItemInput />
                            <RadioGroup.ItemLabel
                                class="w-full p-4"
                                classList={{ "px-2 py-2": props.small }}
                            >
                                <div class="flex flex-row gap-2">
                                    <RadioGroup.ItemControl
                                        class="my-auto flex aspect-square h-6 w-6 items-center justify-center rounded-full border"
                                        classList={{
                                            hidden: !props.vertical
                                        }}
                                    >
                                        <RadioGroup.ItemIndicator class="h-3 w-3 rounded-full bg-white" />
                                    </RadioGroup.ItemControl>
                                    <div class="flex flex-col">
                                        <div
                                            class={"font-semibold"}
                                            classList={{
                                                "text-base": props.small,
                                                "text-md": !props.small,
                                                "text-sm": !props.vertical
                                            }}
                                        >
                                            {choice.label}
                                        </div>
                                        <Show when={!props.small}>
                                            <div class="text-sm font-light">
                                                {choice.caption}
                                            </div>
                                        </Show>
                                    </div>
                                </div>
                            </RadioGroup.ItemLabel>
                        </div>
                    </RadioGroup.Item>
                )}
            </For>
        </RadioGroup.Root>
    );
}
