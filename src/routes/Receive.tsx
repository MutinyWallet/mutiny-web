import { createResource, Show } from "solid-js";
import { Button } from "~/components/Button";
import NavBar from "~/components/NavBar";
import SafeArea from "~/components/SafeArea";
import { useNodeManager } from "~/state/nodeManagerState";

export default function Receive() {
    const { nodeManager } = useNodeManager();

    // TODO: would be nice if this was just newest unused address
    const getNewAddress = async () => {
        console.log("Getting new address");
        const address = await nodeManager()?.get_new_address();
        return address
    };

    const [address, { refetch: refetchAddress }] = createResource(nodeManager, getNewAddress);

    return (
        <SafeArea>
            <main class='flex flex-col gap-4 py-8 px-4'>
                <Show when={address()}>
                    <h1>{address()}</h1>
                    <Button onClick={refetchAddress}>Get new address</Button>
                </Show>
            </main>
            <NavBar activeTab="none" />
        </SafeArea>

    )
}