import { createOptions, Select } from "@thisbeyond/solid-select";

import "~/styles/solid-select.css";

import { createMemo, createSignal, onMount } from "solid-js";

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
