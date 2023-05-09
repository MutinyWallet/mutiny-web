import { useMegaStore } from "~/state/megaStore";
import { Button, InnerCard, VStack } from "~/components/layout";
import { createSignal } from "solid-js";
import eify from "~/utils/eify";
import { showToast } from "./Toaster";
import { downloadTextFile } from "~/utils/download";
import { createFileUploader } from "@solid-primitives/upload"
import { ConfirmDialog } from "./Dialog";
import { MutinyWallet } from "@mutinywallet/mutiny-wasm";

export function ImportExport() {
    const [state, _] = useMegaStore()

    async function handleSave() {
        const json = await state.mutiny_wallet?.export_json()
        downloadTextFile(json || "", "mutiny-state.json")
    }

    const { files, selectFiles } = createFileUploader();

    async function importJson() {
        setConfirmLoading(true);
        const fileReader = new FileReader();

        try {
            const file: File = files()[0].file;
            fileReader.readAsText(file, "UTF-8");
            fileReader.onload = e => {
                const text = e.target?.result?.toString();

                if (text) {
                    // This should throw if there's a parse error, so we won't end up clearing
                    JSON.parse(text);

                    MutinyWallet.import_json(text);

                    window.location.href = "/"

                } else {
                    throw new Error("No text found in file")
                }
            }
        } catch (e) {
            showToast(eify(e));
        }
        setConfirmOpen(false);
        setConfirmLoading(false);
    }

    async function uploadFile() {
        selectFiles(async files => {
            if (files.length) {
                setConfirmOpen(true);
                return;
            }
        })
    }

    const [confirmOpen, setConfirmOpen] = createSignal(false);
    const [confirmLoading, setConfirmLoading] = createSignal(false);

    return (
        <>
            <InnerCard>
                <VStack>
                    <Button onClick={handleSave}>Save State As File</Button>
                    <Button onClick={uploadFile}>Upload Saved State</Button>
                </VStack>
            </InnerCard>
            <ConfirmDialog loading={confirmLoading()} isOpen={confirmOpen()} onConfirm={importJson} onCancel={() => setConfirmOpen(false)}>
                Do you want to replace your state with {files()[0].name}?
            </ConfirmDialog>
        </>
    )
}