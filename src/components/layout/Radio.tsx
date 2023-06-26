import { RadioGroup } from "@kobalte/core";
import { For, Show } from "solid-js";

type Choices = {
    value: string;
    label: string;
    caption: string;
    disabled?: boolean;
}[];

// TODO: how could would it be if we could just pass the estimated fees in here?
export function StyledRadioGroup(props: {
    value: string;
    choices: Choices;
    onValueChange: (value: string) => void;
    small?: boolean;
    accent?: "red" | "white";
    vertical?: boolean;
}) {
    return (
        // TODO: rewrite this with CVA, props are bad for tailwind
        <RadioGroup.Root
            value={props.value}
            onChange={props.onValueChange}
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
                        class={`ui-checked:bg-neutral-950 bg-white/10 rounded outline outline-black/50 ui-checked:outline-m-blue ui-checked:outline-2`}
                        classList={{
                            "ui-checked:outline-m-red": props.accent === "red",
                            "ui-checked:outline-white":
                                props.accent === "white",
                            "ui-disabled:opacity-50": choice.disabled
                        }}
                        disabled={choice.disabled}
                    >
                        <div class={props.small ? "py-2 px-2" : "py-3 px-4"}>
                            <RadioGroup.ItemInput />
                            <RadioGroup.ItemControl>
                                <RadioGroup.ItemIndicator />
                            </RadioGroup.ItemControl>
                            <RadioGroup.ItemLabel class="ui-checked:text-white text-neutral-400">
                                <div class="block">
                                    <div
                                        classList={{
                                            "text-base": props.small,
                                            "text-lg": !props.small
                                        }}
                                        class={`font-semibold max-sm:text-sm`}
                                    >
                                        {choice.label}
                                    </div>
                                    <Show when={!props.small}>
                                        <div class="text-sm font-light">
                                            {choice.caption}
                                        </div>
                                    </Show>
                                </div>
                            </RadioGroup.ItemLabel>
                        </div>
                    </RadioGroup.Item>
                )}
            </For>
        </RadioGroup.Root>
    );
}
