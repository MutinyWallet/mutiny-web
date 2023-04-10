import { useMegaStore } from "~/state/megaStore";
import { ButtonLink } from "./Button";
import Card from "./Card";
import PeerConnectModal from "./PeerConnectModal";
import { createResource } from "solid-js";

export default function KitchenSink() {
    const [state, _] = useMegaStore()

    // TODO: would be nice if this was just newest unused address
    const getNewAddress = async () => {
        if (state.node_manager) {
            console.log("Getting new address");
            const address = await state.node_manager?.get_new_address();
            return address
        } else {
            return undefined
        }
    };

    const [address] = createResource(getNewAddress);

    return (
        <Card title="Kitchen Sink">
            <PeerConnectModal />
            <ButtonLink target="_blank" rel="noopener noreferrer" href={`https://faucet.mutinynet.com/?address=${address()}`}>Tap the Faucet</ButtonLink>
        </Card>
    )
}