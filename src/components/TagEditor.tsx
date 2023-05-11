import { Select, createOptions } from "@thisbeyond/solid-select";
import "~/styles/solid-select.css"
import { For } from "solid-js";
import { ContactEditor } from "./ContactEditor";
import { TinyButton } from "./layout";
import { ContactFormValues } from "./ContactViewer";
import { MutinyTagItem } from "~/utils/tags";
import { Contact } from "@mutinywallet/mutiny-wasm";
import { useMegaStore } from "~/state/megaStore";

// take two arrays, subtract the second from the first, then return the first
function subtract<T>(a: T[], b: T[]) {
    const set = new Set(b);
    return a.filter(x => !set.has(x));
}

const createLabelValue = (label: string): Partial<MutinyTagItem> => {
    return { id: label, name: label, kind: "Label" };
};

export function TagEditor(props: {
    values: MutinyTagItem[],
    setValues: (values: MutinyTagItem[]) => void,
    selectedValues: MutinyTagItem[],
    setSelectedValues: (values: MutinyTagItem[]) => void,
    placeholder: string
}) {
    const [state, actions] = useMegaStore();

    const onChange = (selected: MutinyTagItem[]) => {
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
        createable: createLabelValue,
    });

    async function createContact(contact: ContactFormValues) {
        // FIXME: undefineds
        // FIXME: npub not valid? other undefineds
        const c = new Contact(contact.name, undefined, undefined, undefined);
        const newContactId = await state.mutiny_wallet?.create_new_contact(c);
        const contactItem = await state.mutiny_wallet?.get_contact(newContactId ?? "");
        const mutinyContactItem: MutinyTagItem = { id: contactItem?.id || "", name: contactItem?.name || "", kind: "Contact", last_used_time: 0n };
        if (contactItem) {
            // @ts-ignore
            // FIXME: make typescript less mad about this
            onChange([...props.selectedValues, mutinyContactItem])
        } else {
            console.error("Failed to create contact")
        }
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
                        <TinyButton tag={tag} onClick={() => onChange([...props.selectedValues, tag])}
                        >
                            {tag.name}
                        </TinyButton>
                    )}
                </For>
                <ContactEditor createContact={createContact} />
            </div>
        </div >
    )
}