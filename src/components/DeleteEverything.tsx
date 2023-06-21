import initMutinyWallet, { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { createSignal } from "solid-js";
import { ConfirmDialog } from "~/components/Dialog";
import { Button } from "~/components/layout";
import { showToast } from "~/components/Toaster";
import { useMegaStore } from "~/state/megaStore";
import eify from "~/utils/eify";

export function DeleteEverything(props: { emergency?: boolean }) {
    const [state, actions] = useMegaStore();

    async function confirmReset() {
        setConfirmOpen(true);
    }

    const [confirmOpen, setConfirmOpen] = createSignal(false);
    const [confirmLoading, setConfirmLoading] = createSignal(false);

    async function resetNode() {
        try {
            setConfirmLoading(true);
            // If we're in a context where the wallet is loaded we want to use the regular action to delete it
            // Otherwise we just call the import_json method directly
            if (state.mutiny_wallet && !props.emergency) {
                try {
                    await actions.deleteMutinyWallet();
                } catch (e) {
                    // If we can't stop we want to keep going
                    console.error(e);
                }
            } else {
                // If there's no mutiny_wallet loaded we might need to initialize WASM
                await initMutinyWallet();
                await MutinyWallet.import_json("{}");
            }

            showToast({ title: "Deleted", description: `Deleted all data` });

            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
        } catch (e) {
            console.error(e);
            showToast(eify(e));
        } finally {
            setConfirmOpen(false);
            setConfirmLoading(false);
        }
    }

    return (
        <>
            <Button onClick={confirmReset}>Delete Everything</Button>
            <ConfirmDialog
                loading={confirmLoading()}
                open={confirmOpen()}
                onConfirm={resetNode}
                onCancel={() => setConfirmOpen(false)}
            >
                This will delete your node's state. This can't be undone!
            </ConfirmDialog>
        </>
    );
}
