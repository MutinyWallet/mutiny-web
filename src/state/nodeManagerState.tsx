import { NodeManager } from "@mutinywallet/node-manager";
import { createContext, JSX, useContext, createResource } from "solid-js";
import { setupNodeManager } from "~/logic/nodeManagerSetup";

const NodeManagerContext = createContext();

export function NodeManagerProvider(props: { children: JSX.Element }) {
    const [nodeManager] = createResource({}, setupNodeManager);

    const fetchBalance = async (nm: NodeManager) => {
        console.log("refetching balance");
        const balance = await nm.get_balance();
        return balance
    };

    const [balance, { refetch }] = createResource(nodeManager, fetchBalance);

    const value = {
        nodeManager,
        balance,
        refetchBalance: refetch
    };

    return (
        <NodeManagerContext.Provider value={value}>
            {props.children}
        </NodeManagerContext.Provider>
    )
}

export function useNodeManager() { return useContext(NodeManagerContext); }
