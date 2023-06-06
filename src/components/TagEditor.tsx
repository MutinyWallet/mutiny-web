import { Select, createOptions } from "@thisbeyond/solid-select";
import "~/styles/solid-select.css";
import { For, Show, createMemo, createSignal, onMount } from "solid-js";
import { TinyButton } from "./layout";
import { MutinyTagItem, sortByLastUsed } from "~/utils/tags";
import { useMegaStore } from "~/state/megaStore";

const createLabelValue = (label: string): Partial<MutinyTagItem> => {
    return { name: label, kind: "Contact" };
};

export function TagEditor(props: {
    selectedValues: Partial<MutinyTagItem>[];
    setSelectedValues: (value: Partial<MutinyTagItem>[]) => void;
    placeholder: string;
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
        }
    });

    const selectProps = createMemo(() => {
        return createOptions(availableTags() || [], {
            key: "name",
            filterable: true, // Default
            createable: createLabelValue
        });
    });

    const onChange = (selected: MutinyTagItem[]) => {
        props.setSelectedValues(selected);

        console.log(selected);

        const lastValue = selected[selected.length - 1];
        if (
            lastValue &&
            availableTags() &&
            !availableTags()!.includes(lastValue)
        ) {
            setAvailableTags([...availableTags(), lastValue]);
        }
    };

    // FIXME: eslint is mad about reactivity
    const onTagTap = (tag: MutinyTagItem) => {
        props.setSelectedValues([...props.selectedValues!, tag]);
    };

    return (
        <div class="flex flex-col gap-2 flex-shrink flex-1">
            <Select
                multiple
                initialValue={props.selectedValues}
                placeholder={props.placeholder}
                onChange={onChange}
                {...selectProps()}
            />
            <div class="flex gap-2 flex-wrap">
                <Show when={availableTags() && availableTags()!.length > 0}>
                    <For each={availableTags()!.slice(0, 3)}>
                        {(tag) => (
                            // eslint-disable-next-line solid/reactivity
                            <TinyButton tag={tag} onClick={() => onTagTap(tag)}>
                                {tag.name}
                            </TinyButton>
                        )}
                    </For>
                </Show>
            </div>
        </div>
    );
}
