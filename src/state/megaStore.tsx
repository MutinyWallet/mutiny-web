// Inspired by https://github.com/solidjs/solid-realworld/blob/main/src/store/index.js

import { ParentComponent, createContext, createEffect, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { setupNodeManager } from "~/logic/nodeManagerSetup";
import { NodeManager } from "@mutinywallet/node-manager";

const MegaStoreContext = createContext<MegaStore>();

type UserStatus = undefined | "new_here" | "waitlisted" | "approved" | "paid"

export type MegaStore = [{
    waitlist_id: string | null;
    node_manager: NodeManager | undefined;
    user_status: UserStatus;
}, {
    status(): Promise<UserStatus>;
    setupNodeManager(): Promise<void>;
    setWaitlistId(waitlist_id: string): void;
}];

export const Provider: ParentComponent = (props) => {
    const [state, setState] = createStore({

        waitlist_id: localStorage.getItem("waitlist_id"),
        node_manager: undefined as NodeManager | undefined,
        user_status: undefined as UserStatus,
    });

    const actions = {
        async status(): Promise<UserStatus> {
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

                // TODO: handle paid status

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
        }
    };

    // Fetch status from remote on load
    createEffect(() => {
        actions.status().then(status => {
            setState({ user_status: status })
        })
    })

    // Only node manager when status is approved
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