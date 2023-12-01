import { createOptions, Select } from "@thisbeyond/solid-select";

import "~/styles/solid-select.css";

import { TagItem, TagKind } from "@johncantrell97/mutiny-wasm";
import { createMemo, createSignal, onMount } from "solid-js";

import { useMegaStore } from "~/state/megaStore";
import { sortByLastUsed } from "~/utils";

const createLabelValue = (label: string): Partial<TagItem> => {
    return { name: label, kind: TagKind.Contact };
};

export function TagEditor(props: {
    selectedValues: Partial<TagItem>[];
    setSelectedValues: (value: Partial<TagItem>[]) => void;
    placeholder: string;
    autoFillTag?: string | undefined;
}) {
    const [_state, actions] = useMegaStore();
    const [availableTags, setAvailableTags] = createSignal<TagItem[]>([]);

    onMount(async () => {
        const tags = await actions.listTags();
        if (tags) {
            setAvailableTags(
                tags
                    .filter((tag) => tag.kind === TagKind.Contact)
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

    const onChange = (selected: TagItem[]) => {
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

    return (
        <>
            <Select
                multiple
                initialValue={props.selectedValues}
                placeholder={props.placeholder}
                onChange={onChange}
                {...selectProps()}
            />
        </>
    );
}
