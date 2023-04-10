import { QRCodeSVG } from "solid-qr-code";
import { As, Dialog } from "@kobalte/core";
import { Button, Card } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";
import { Show, createResource } from "solid-js";
import { getExistingSettings } from "~/logic/nodeManagerSetup";
import getHostname from "~/utils/getHostname";

const OVERLAY = "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
const DIALOG_POSITIONER = "fixed inset-0 z-50 flex items-center justify-center"
const DIALOG_CONTENT = "w-[80vw] max-w-[400px] p-4 bg-gray/50 backdrop-blur-md shadow-xl rounded-xl border border-white/10"
const SMALL_HEADER = "text-sm font-semibold uppercase"

export default function PeerConnectModal() {
    const [state, _] = useMegaStore()

    const getPeerConnectString = async () => {
        if (state.node_manager) {
            const { proxy } = getExistingSettings();
            const nodes = await state.node_manager.list_nodes();
            const firstNode = nodes[0] as string || ""
            const hostName = getHostname(proxy || "")
            const connectString = `mutiny:${firstNode}@${hostName}`
            return connectString
        } else {
            return undefined
        }
    };

    const [peerConnectString] = createResource(getPeerConnectString);


    // TODO: a lot of this markup is probably reusable as a "Modal" component
    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <As component={Button}>Show Peer Connect Info</As>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay class={OVERLAY} />
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT}>
                        <div class="flex justify-between mb-2">
                            <Dialog.Title class={SMALL_HEADER}>Peer connect info</Dialog.Title>
                            <Dialog.CloseButton class="dialog__close-button">
                                <code>X</code>
                            </Dialog.CloseButton>
                        </div>
                        <Dialog.Description class="flex flex-col gap-4">
                            <Show when={peerConnectString()}>
                                <div class="w-full bg-white rounded-xl">
                                    <QRCodeSVG value={peerConnectString() || ""} class="w-full h-full p-8 max-h-[400px]" />
                                </div>
                                <Card>
                                    <code class="break-all">{peerConnectString() || ""}</code>
                                </Card>
                            </Show>
                        </Dialog.Description>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root >
    )
}