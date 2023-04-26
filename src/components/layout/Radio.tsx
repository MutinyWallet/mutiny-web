import { RadioGroup } from "@kobalte/core";
import { For, Show } from "solid-js";

type Choices = { value: string, label: string, caption: string }[]

// TODO: how could would it be if we could just pass the estimated fees in here?
export function StyledRadioGroup(props: { value: string, choices: Choices, onValueChange: (value: string) => void, small?: boolean, }) {
    return (
        <RadioGroup.Root value={props.value} onValueChange={(e) => props.onValueChange(e)} class={`grid w-full gap-${props.small ? "2" : "4"} grid-cols-${props.choices.length.toString()}`}>
            <For each={props.choices}>
                {choice =>
                    <RadioGroup.Item value={choice.value} class="ui-checked:bg-neutral-950 bg-white/10 rounded outline outline-black/50 ui-checked:outline-m-blue ui-checked:outline-2">
                        <div class={props.small ? "py-2 px-2" : "py-3 px-4"}>
                            <RadioGroup.ItemInput />
                            <RadioGroup.ItemControl >
                                <RadioGroup.ItemIndicator />
                            </RadioGroup.ItemControl>
                            <RadioGroup.ItemLabel class="ui-checked:text-white text-neutral-400">
                                <div class="block">
                                    <div class={`text-${props.small ? "base" : "lg"} font-semibold`}>{choice.label}</div>
                                    <Show when={!props.small}>
                                        <div class="text-sm font-light">{choice.caption}</div>
                                    </Show>
                                </div>
                            </RadioGroup.ItemLabel>
                        </div>
                    </RadioGroup.Item>
                }
            </For>
        </RadioGroup.Root>
    )
}