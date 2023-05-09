import { Select, createOptions } from "@thisbeyond/solid-select";
import "~/styles/solid-select.css"
import { For, createUniqueId } from "solid-js";
import { ContactEditor } from "./ContactEditor";
import { ContactItem, TagItem, TextItem, addContact } from "~/state/contacts";
import { TinyButton } from "./layout";

// take two arrays, subtract the second from the first, then return the first
function subtract<T>(a: T[], b: T[]) {
    const set = new Set(b);
    return a.filter(x => !set.has(x));
}

const createValue = (name: string): TextItem => {
    return { id: createUniqueId(), name, kind: "text" };
};

export function TagEditor(props: { values: TagItem[], setValues: (values: TagItem[]) => void, selectedValues: TagItem[], setSelectedValues: (values: TagItem[]) => void, placeholder: string }) {
    const onChange = (selected: TagItem[]) => {
        props.setSelectedValues(selected);

        console.log(selected)

        const lastValue = selected[selected.length - 1];
        if (lastValue && !props.values.includes(lastValue)) {
            props.setValues([...props.values, lastValue]);
        }
    };

    const selectProps = createOptions(props.values, {
        key: "name",
        disable: (value) => props.selectedValues.includes(value),
        filterable: true, // Default
        createable: createValue,
    });

    const newContact = async (contact: ContactItem) => {
        await addContact(contact)
        onChange([...props.selectedValues, contact])
    }

    return (
        <div class="flex flex-col gap-2 flex-grow flex-shrink flex-1" >
            {/* FIXME this is causing overflow scroll for now good reason */}
            <Select
                multiple
                initialValue={props.selectedValues}
                onChange={onChange}
                placeholder={props.placeholder}
                {...selectProps}
            />
            <div class="flex gap-2 flex-wrap">
                <For each={subtract(props.values, props.selectedValues).slice(0, 3)}>
                    {(tag) => (
                        <TinyButton onClick={() => onChange([...props.selectedValues, tag])}
                        >
                            {tag.name}
                        </TinyButton>
                    )}
                </For>
                <ContactEditor createContact={newContact} />
            </div>
        </div >
    )
}