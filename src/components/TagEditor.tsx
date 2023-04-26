import { Select, createOptions } from "@thisbeyond/solid-select";
import "~/styles/solid-select.css"
import { SmallHeader } from "./layout";

// take two arrays, subtract the second from the first, then return the first
function subtract<T>(a: T[], b: T[]) {
    const set = new Set(b);
    return a.filter(x => !set.has(x));
};

// simple math.random based id generator
const createUniqueId = () => Math.random().toString(36).substr(2, 9);

export type TagItem = {
    id: string;
    name: string;
    kind: "text" | "contact";
}

const createValue = (name: string) => {
    return { id: createUniqueId(), name, kind: "text" };
};

export function TagEditor(props: { title: string, values: TagItem[], setValues: (values: TagItem[]) => void, selectedValues: TagItem[], setSelectedValues: (values: TagItem[]) => void }) {
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

    return (
        <div class="flex flex-col gap-2 flex-grow flex-shrink flex-1" >
            <SmallHeader>{props.title}</SmallHeader>
            <Select
                multiple
                onChange={onChange}
                placeholder="Where's it coming from?"
                {...selectProps}
            />

            {/* TODO: blocked on https://github.com/thisbeyond/solid-select/issues/39 */}
            {/* <div class="flex gap-2 flex-wrap">
                <For each={subtract(props.values, props.selectedValues).slice(0, 3)}>
                    {(contact) => (
                        <div onClick={() => onChange([...props.selectedValues, contact])} class="bg-m-blue/50 px-1 py-[0.5] rounded cursor-pointer hover:outline-white hover:outline-1">{contact.name}</div>
                    )}
                </For>
                <button class="bg-black border border-white px-1 py-[0.5] rounded cursor-pointer hover:outline-white hover:outline-1">+ Add Contact</button>
            </div> */}
        </div >
    )
}