import { Select, createOptions } from "@thisbeyond/solid-select";
import { For, createSignal } from "solid-js";
import "~/styles/solid-select.css"
import { SmallHeader } from "./layout";


// take two arrays, subtract the second from the first, then return the first
function subtract<T>(a: T[], b: T[]) {
    const set = new Set(b);
    return a.filter(x => !set.has(x));
};

// combine two arrays and keep only the items that are unique
function combineUnique<T>(a: T[], b: T[]) {
    const set = new Set([...a, ...b]);
    return [...set];
};

// simple math.random based id generator
const createUniqueId = () => Math.random().toString(36).substr(2, 9);

type Contact = {
    id: string;
    name: string;
}

const fakeContacts: Contact[] = [
    { id: createUniqueId(), name: "👤 Alice" },
    { id: createUniqueId(), name: "👤 Tony" },
    { id: createUniqueId(), name: "👤 @benthecarman" },
    { id: createUniqueId(), name: "👀 Uknown" }
]

const createValue = (name: string) => {
    return { id: createUniqueId(), name };
};

export function TagEditor() {
    const candidates = [...fakeContacts];

    const [values, setValues] = createSignal(candidates);
    const [selectedValues, setSelectedValues] = createSignal<Contact[]>([]);

    const onChange = (selected: Contact[]) => {
        setSelectedValues(selected);

        const lastValue = selected[selected.length - 1];
        if (lastValue && !values().includes(lastValue)) {
            setValues([...values(), lastValue]);
        }
    };

    const props = createOptions(values, {
        key: "name",
        disable: (value) => selectedValues().includes(value),
        filterable: true, // Default
        createable: createValue,
    });

    return (
        <div class="flex flex-col gap-2 flex-grow flex-shrink flex-1" >
            <SmallHeader>Tag the origin</SmallHeader>
            <Select
                multiple
                onChange={onChange}
                placeholder="Where's it coming from?"
                {...props}
            />
            <div class="flex gap-2 flex-wrap">
                <For each={subtract(fakeContacts, selectedValues())}>
                    {(contact) => (
                        <div onClick={() => onChange([...selectedValues(), contact])} class="bg-m-blue px-1 rounded cursor-pointer hover:outline-white hover:outline-1">+ {contact.name}</div>
                    )}
                </For>
            </div>
            {/* <div>
                <pre>{JSON.stringify(selectedValues(), null, 2)}</pre>
            </div>
            <div>
                <pre>{JSON.stringify(values(), null, 2)}</pre>
            </div> */}
        </div >
    )
}