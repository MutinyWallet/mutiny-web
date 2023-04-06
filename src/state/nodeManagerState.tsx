import { NodeManager } from "@mutinywallet/node-manager";
import { createContext, JSX, useContext, createResource, Resource } from "solid-js";
import { setupNodeManager } from "~/logic/nodeManagerSetup";

const NodeManagerContext = createContext<{ nodeManager: Resource<NodeManager> }>();

export function NodeManagerProvider(props: { children: JSX.Element }) {
    const [nodeManager] = createResource(setupNodeManager);

    const value = {
        nodeManager,
    };

    return (
        <NodeManagerContext.Provider value={value}>
            {props.children}
        </NodeManagerContext.Provider>
    )
}

export function useNodeManager() {
    // This is a trick to narrow the typescript types: https://docs.solidjs.com/references/api-reference/component-apis/createContext
    const context = useContext(NodeManagerContext);
    if (!context) {
        throw new Error("useNodeManager: cannot find a NodeManagerContext")
    }
    return context;
}
