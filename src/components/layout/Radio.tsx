import { RadioGroup } from "@kobalte/core";
import { For } from "solid-js";

type Choices = { value: string, label: string, caption: string }[]

// TODO: how could would it be if we could just pass the estimated fees in here?
export function StyledRadioGroup(props: { value: string, choices: Choices, onValueChange: (value: string) => void }) {
    return (
        <RadioGroup.Root value={props.value} onValueChange={(e) => props.onValueChange(e)} class="grid w-full gap-4 grid-cols-2">
            <For each={props.choices}>
                {choice =>
                    <RadioGroup.Item value={choice.value} class="ui-checked:bg-white bg-white/10 rounded outline outline-black/50 ui-checked:outline-m-blue ui-checked:outline-2">
                        <div class="py-3 px-4">
                            <RadioGroup.ItemInput class="radio__input " />
                            <RadioGroup.ItemControl class="radio__control">
                                <RadioGroup.ItemIndicator class="radio__indicator" />
                            </RadioGroup.ItemControl>
                            <RadioGroup.ItemLabel class="ui-checked:text-m-blue text-neutral-400">
                                <div class="block">
                                    <div class="text-lg font-semibold">{choice.label}</div>
                                    <div class="text-lg font-light">{choice.caption}</div>
                                </div>
                            </RadioGroup.ItemLabel>
                        </div>
                    </RadioGroup.Item>
                }
            </For>
        </RadioGroup.Root>
    )
}