import { createOptions, Select } from "@thisbeyond/solid-select";

import "~/styles/solid-select.css";

import { createMemo, createSignal, For, onMount, Show } from "solid-js";

import { TinyButton } from "~/components";
import { useMegaStore } from "~/state/megaStore";
import { MutinyTagItem, sortByLastUsed } from "~/utils";

const createLabelValue = (label: string): Partial<MutinyTagItem> => {
    return { name: label, kind: "Contact" };
};

export function TagEditor(props: {
    selectedValues: Partial<MutinyTagItem>[];
    setSelectedValues: (value: Partial<MutinyTagItem>[]) => void;
    placeholder: string;
    autoFillTag?: string | undefined;
}) {
    const [_state, actions] = useMegaStore();
    const [availableTags, setAvailableTags] = createSignal<MutinyTagItem[]>([]);

    onMount(async () => {
        const tags = await actions.listTags();
        if (tags) {
            setAvailableTags(
                tags
                    .filter((tag) => tag.kind === "Contact")
                    .sort(sortByLastUsed)
            );
            if (props.autoFillTag && availableTags()) {
                const tagToAutoSelect = availableTags().find(
                    (tag) => tag.name === props.autoFillTag
                );
                if (tagToAutoSelect) {
                    props.setSelectedValues([
                        ...props.selectedValues,
                        tagToAutoSelect
                    ]);
                }
            }
        }
    });

    const selectProps = createMemo(() => {
        return createOptions(availableTags() || [], {
            key: "name",
            disable: (value) => props.selectedValues.includes(value),
            filterable: true, // Default
            createable: createLabelValue
        });
    });

    const onChange = (selected: MutinyTagItem[]) => {
        props.setSelectedValues(selected);

        const lastValue = selected[selected.length - 1];
        if (
            lastValue &&
            availableTags() &&
            !availableTags()!.includes(lastValue)
        ) {
            setAvailableTags([...availableTags(), lastValue]);
        }
    };

    const onTagTap = (tag: MutinyTagItem) => {
        props.setSelectedValues([...props.selectedValues!, tag]);
    };

    return (
        <div class="flex flex-1 flex-shrink flex-col gap-2">
            <Select
                multiple
                initialValue={props.selectedValues}
                placeholder={props.placeholder}
                onChange={onChange}
                {...selectProps()}
            />
            <div class="flex flex-wrap gap-2">
                <Show when={availableTags() && availableTags()!.length > 0}>
                    <For
                        each={availableTags()!.slice(0, 3).sort(sortByLastUsed)}
                    >
                        {(tag) => (
                            <TinyButton
                                hidden={props.selectedValues.includes(tag)}
                                tag={tag}
                                // eslint-disable-next-line solid/reactivity
                                onClick={() => onTagTap(tag)}
                            >
                                {tag.name}
                            </TinyButton>
                        )}
                    </For>
                </Show>
            </div>
        </div>
    );
}
