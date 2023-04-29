import { createSignal } from "solid-js";
import { ConfirmDialog } from "~/components/Dialog";
import { Button } from "~/components/layout";
import { showToast } from "~/components/Toaster";
import { useMegaStore } from "~/state/megaStore";

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
    const [state, actions] = useMegaStore();
    async function resetNode() {
        await state.node_manager?.stop();
        await state.node_manager?.free();
        await actions.deleteNodeManager();
        setConfirmLoading(true);
        deleteDb("gossip")
        deleteDb("wallet")
        localStorage.clear();
        showToast({ title: "Deleted", description: `Deleted all data` })
        setConfirmOpen(false);
        setConfirmLoading(false);
	/*
        setTimeout(() => {
            window.location.href = "/";
        }, 3000);
	*/
    }

    async function confirmReset() {
        setConfirmOpen(true);
    }

    const [confirmOpen, setConfirmOpen] = createSignal(false);
    const [confirmLoading, setConfirmLoading] = createSignal(false);

    return (
        <>
            <Button onClick={confirmReset}>Delete Everything</Button>
            <ConfirmDialog loading={confirmLoading()} isOpen={confirmOpen()} onConfirm={resetNode} onCancel={() => setConfirmOpen(false)}>
                This will delete your node's state. This can't be undone!
            </ConfirmDialog>
        </>
    )
}
