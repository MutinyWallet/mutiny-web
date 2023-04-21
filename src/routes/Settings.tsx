import { createSignal } from "solid-js";
import { useNavigate } from "solid-start";
import { ConfirmDialog } from "~/components/Dialog";
import KitchenSink from "~/components/KitchenSink";
import { Button, Card, DefaultMain, Hr, LargeHeader, SafeArea } from "~/components/layout";
import NavBar from "~/components/NavBar";
import { SettingsStringsEditor } from "~/components/SettingsStringsEditor";
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

export default function Settings() {
    const navigate = useNavigate();

    const [_, actions] = useMegaStore();

    async function resetNode() {
        setConfirmLoading(true);
        deleteDb("gossip")
        localStorage.clear();
        showToast({ title: "Deleted", description: `Deleted all data` })
        setConfirmOpen(false);
        setConfirmLoading(false);
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    async function confirmReset() {
        setConfirmOpen(true);
    }

    const [confirmOpen, setConfirmOpen] = createSignal(false);
    const [confirmLoading, setConfirmLoading] = createSignal(false);

    return (
        <SafeArea>
            <DefaultMain>
                <LargeHeader>Settings</LargeHeader>
                <SettingsStringsEditor />
                <Card title="Random utilities">
                    {/* <Button onClick={clearWaitlistId}>Clear waitlist_id</Button> */}
                    {/* <Button onClick={setTestWaitlistId}>Use test waitlist_id</Button> */}
                    <Button onClick={confirmReset}>Delete Everything</Button>
                    <ConfirmDialog loading={confirmLoading()} isOpen={confirmOpen()} onConfirm={resetNode} onCancel={() => setConfirmOpen(false)} />
                </Card>
            </DefaultMain>
            <NavBar activeTab="settings" />
        </SafeArea>
    )
}