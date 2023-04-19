// Inspired by https://github.com/solidjs/solid-realworld/blob/main/src/store/index.js

import { ParentComponent, createContext, createEffect, onCleanup, onMount, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { setupNodeManager } from "~/logic/nodeManagerSetup";
import { MutinyBalance, NodeManager } from "@mutinywallet/mutiny-wasm";

const MegaStoreContext = createContext<MegaStore>();

type UserStatus = undefined | "new_here" | "waitlisted" | "approved" | "paid"

export type MegaStore = [{
    waitlist_id?: string;
    node_manager?: NodeManager;
    user_status: UserStatus;
    scan_result?: string;
    balance?: MutinyBalance;
    last_sync?: number;
    price: number
}, {
    fetchUserStatus(): Promise<UserStatus>;
    setupNodeManager(): Promise<void>;
    setWaitlistId(waitlist_id: string): void;
    sync(): Promise<void>;
}];

export const Provider: ParentComponent = (props) => {
    const [state, setState] = createStore({
        waitlist_id: localStorage.getItem("waitlist_id"),
        node_manager: undefined as NodeManager | undefined,
        user_status: undefined as UserStatus,
        // TODO: wire this up to real price once we have caching
        price: 30000
    });

    const actions = {
        async fetchUserStatus(): Promise<UserStatus> {
            if (!state.waitlist_id) {
                return "new_here"
            }
            try {
                const res = await fetch(`https://waitlist.mutiny-waitlist.workers.dev/waitlist/${state.waitlist_id}`)
                const data = await res.json();

                if (data.approval_date) {
                    return "approved"
                } else {
                    return "waitlisted"
                }

            } catch (e) {
                return "new_here"
            }
        },
        async setupNodeManager(): Promise<void> {
            try {
                const nodeManager = await setupNodeManager()
                setState({ node_manager: nodeManager })
            } catch (e) {
                console.error(e)
            }
        },
        setWaitlistId(waitlist_id: string) {
            setState({ waitlist_id })
        },
        async sync(): Promise<void> {
            console.time("BDK Sync Time")
            console.groupCollapsed("BDK Sync")
            try {
                await state.node_manager?.sync()
            } catch (e) {
                console.error(e);
            }
            console.groupEnd();
            console.timeEnd("BDK Sync Time")
        }
    };

    // Fetch status from remote on load
    onMount(() => {
        actions.fetchUserStatus().then(status => {
            setState({ user_status: status })
        })
    })

    // Only load node manager when status is approved
    createEffect(() => {
        if (state.user_status === "approved" && !state.node_manager) {
            console.log("running setup node manager...")
            actions.setupNodeManager().then(() => console.log("node manager setup done"))
        }
    })

    // Be reactive to changes in waitlist_id
    createEffect(() => {
        state.waitlist_id ? localStorage.setItem("waitlist_id", state.waitlist_id) : localStorage.removeItem("waitlist_id");
    });

    createEffect(() => {
        const interval = setInterval(() => {
            if (state.node_manager) actions.sync();
        }, 60 * 1000); // Poll every minute

        onCleanup(() => {
            clearInterval(interval);
        });
    })

    const store = [state, actions] as MegaStore;

    return (
        <MegaStoreContext.Provider value={store}>
            {props.children}
        </MegaStoreContext.Provider>
    )
}

export function useMegaStore() {
    // This is a trick to narrow the typescript types: https://docs.solidjs.com/references/api-reference/component-apis/createContext
    const context = useContext(MegaStoreContext);
    if (!context) {
        throw new Error("useMegaStore: cannot find a MegaStoreContext")
    }
    return context;
}