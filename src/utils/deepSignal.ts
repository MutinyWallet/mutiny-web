import { Signal } from "solid-js";
import { createStore, reconcile, unwrap } from "solid-js/store";

// All these shenanigans are so we don't get a flicker after every refresh
// API may change in the future: https://docs.solidjs.com/references/api-reference/basic-reactivity/createResource
export function createDeepSignal<T>(value: T): Signal<T> {
    const [store, setStore] = createStore({
        value
    });
    return [
        // eslint-disable-next-line
        () => store.value,
        // eslint-disable-next-line
        (v: T) => {
            const unwrapped = unwrap(store.value);
            typeof v === "function" && (v = v(unwrapped));
            setStore("value", reconcile(v, { merge: true }));
            return store.value;
        }
    ] as Signal<T>;
}
