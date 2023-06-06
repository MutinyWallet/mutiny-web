import { QRCodeSVG } from "solid-qr-code";
import { As, Dialog } from "@kobalte/core";
import { Button, Card } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";
import { createResource, Show } from "solid-js";

const OVERLAY = "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm";
const DIALOG_POSITIONER = "fixed inset-0 z-50 flex items-center justify-center";
const DIALOG_CONTENT =
    "w-[80vw] max-w-[400px] max-h-[100dvh] overflow-y-auto disable-scrollbars p-4 bg-gray/50 backdrop-blur-md shadow-xl rounded-xl border border-white/10";
const SMALL_HEADER = "text-sm font-semibold uppercase";

export default function NostrWalletConnectModal() {
    const [state, actions] = useMegaStore();

    const getConnectionURI = () => {
        if (state.mutiny_wallet) {
            return state.mutiny_wallet.get_nwc_uri();
        } else {
            return undefined;
        }
    };

    const [connectionURI] = createResource(getConnectionURI);

    const toggleNwc = async () => {
        if (state.nwc_enabled) {
            actions.setNwc(false);
            window.location.reload();
        } else {
            actions.setNwc(true);
            const nodes = await state.mutiny_wallet?.list_nodes();
            const firstNode = (nodes[0] as string) || "";
            await state.mutiny_wallet?.start_nostr_wallet_connect(firstNode);
        }
    };

    // TODO: a lot of this markup is probably reusable as a "Modal" component
    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <As component={Button}>Show Nostr Wallet Connect URI</As>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay class={OVERLAY} />
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT}>
                        <div class="flex justify-between mb-2">
                            <Dialog.Title class={SMALL_HEADER}>
                                Nostr Wallet Connect
                            </Dialog.Title>
                            <Dialog.CloseButton class="dialog__close-button">
                                <code>X</code>
                            </Dialog.CloseButton>
                        </div>
                        <Dialog.Description class="flex flex-col gap-4">
                            <Show when={connectionURI()}>
                                <div class="w-full bg-white rounded-xl">
                                    <QRCodeSVG
                                        value={connectionURI() || ""}
                                        class="w-full h-full p-8 max-h-[400px]"
                                    />
                                </div>
                                <Card>
                                    <code class="break-all">
                                        {connectionURI() || ""}
                                    </code>
                                </Card>
                            </Show>
                            <Button onClick={toggleNwc}>
                                {state.nwc_enabled ? "Disable" : "Enable"}
                            </Button>
                        </Dialog.Description>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
