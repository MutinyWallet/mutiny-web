import { createSignal } from "solid-js";
import { ConfirmDialog } from "~/components/Dialog";
import { Button } from "~/components/layout";
import { showToast } from "~/components/Toaster";
import { useMegaStore } from "~/state/megaStore";
import eify from "~/utils/eify";

export function deleteDb(name: string) {
    const req = indexedDB.deleteDatabase(name);
    req.onsuccess = function () {
        console.log("Deleted database successfully");
        showToast({ title: "Deleted", description: `Deleted "${name}" database successfully` })
    };
    req.onerror = function () {
        console.error("Couldn't delete database");
        showToast(new Error("Couldn't delete database"))
    };
    req.onblocked = function () {
        console.error("Couldn't delete database due to the operation being blocked");
        showToast(new Error("Couldn't delete database due to the operation being blocked"))
    };
}

export function DeleteEverything() {
    const [_state, actions] = useMegaStore();

    async function confirmReset() {
        setConfirmOpen(true);
    }

    const [confirmOpen, setConfirmOpen] = createSignal(false);
    const [confirmLoading, setConfirmLoading] = createSignal(false);


    async function resetNode() {
        try {
            setConfirmLoading(true);
            await actions.deleteMutinyWallet();
            showToast({ title: "Deleted", description: `Deleted all data` })

            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
        } catch (e) {
            console.error(e)
            showToast(eify(e))
        } finally {
            setConfirmOpen(false);
            setConfirmLoading(false);
        }
    }

    return (
        <>
            <Button onClick={confirmReset}>Delete Everything</Button>
            <ConfirmDialog loading={confirmLoading()} open={confirmOpen()} onConfirm={resetNode} onCancel={() => setConfirmOpen(false)}>
                This will delete your node's state. This can't be undone!
            </ConfirmDialog>
        </>
    )
}
