// copied from https://github.com/solidjs-community/solid-primitives/tree/main/packages/scheduled#readme

import { getOwner, onCleanup } from "solid-js";

export type ScheduleCallback = <Args extends unknown[]>(
    callback: (...args: Args) => void,
    wait?: number
) => Scheduled<Args>;

export interface Scheduled<Args extends unknown[]> {
    (...args: Args): void;
    clear: VoidFunction;
}

/**
 * Creates a callback that is debounced and cancellable. The debounced callback is called on **trailing** edge.
 *
 * The timeout will be automatically cleared on root dispose.
 *
 * @param callback The callback to debounce
 * @param wait The duration to debounce in milliseconds
 * @returns The debounced function
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/scheduled#debounce
 *
 * @example
 * ```ts
 * const fn = debounce((message: string) => console.log(message), 250);
 * fn('Hello!');
 * fn.clear() // clears a timeout in progress
 * ```
 */
export const debounce: ScheduleCallback = (callback, wait) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const clear = () => clearTimeout(timeoutId);
    if (getOwner()) onCleanup(clear);
    const debounced: typeof callback = (...args) => {
        if (timeoutId !== undefined) clear();
        timeoutId = setTimeout(() => callback(...args), wait);
    };
    return Object.assign(debounced, { clear });
};
