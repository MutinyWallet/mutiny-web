import { useMegaStore } from "~/state/megaStore";
import { Button, InnerCard, NiceP, VStack } from "~/components/layout";
import { createSignal } from "solid-js";
import eify from "~/utils/eify";
import { showToast } from "./Toaster";
import { downloadTextFile } from "~/utils/download";
import { createFileUploader } from "@solid-primitives/upload";
import { ConfirmDialog } from "./Dialog";
import initMutinyWallet, { MutinyWallet } from "@mutinywallet/mutiny-wasm";

export function ImportExport(props: { emergency?: boolean }) {
    const [state, _] = useMegaStore();

    async function handleSave() {
        const json = await MutinyWallet.export_json();
        downloadTextFile(json || "", "mutiny-state.json");
    }

    const { files, selectFiles } = createFileUploader();

    async function importJson() {
        setConfirmLoading(true);
        const fileReader = new FileReader();

        try {
            const file: File = files()[0].file;

            const text = await new Promise<string | null>((resolve, reject) => {
                fileReader.onload = (e) => {
                    const result = e.target?.result?.toString();
                    if (result) {
                        resolve(result);
                    } else {
                        reject(new Error("No text found in file"));
                    }
                };
                fileReader.onerror = (_e) =>
                    reject(new Error("File read error"));
                fileReader.readAsText(file, "UTF-8");
            });

            if (state.mutiny_wallet && !props.emergency) {
                console.log("Mutiny wallet loaded, stopping");
                try {
                    await state.mutiny_wallet.stop();
                } catch (e) {
                    console.error(e);
                }
            } else {
                // If there's no mutiny wallet loaded we need to initialize WASM
                console.log("Initializing WASM");
                await initMutinyWallet();
            }

            // This should throw if there's a parse error, so we won't end up clearing
            if (text) {
                JSON.parse(text);
                await MutinyWallet.import_json(text);
            }

            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
        } catch (e) {
            showToast(eify(e));
        } finally {
            setConfirmOpen(false);
            setConfirmLoading(false);
        }
    }

    async function uploadFile() {
        selectFiles(async (files) => {
            if (files.length) {
                setConfirmOpen(true);
                return;
            }
        });
    }

    const [confirmOpen, setConfirmOpen] = createSignal(false);
    const [confirmLoading, setConfirmLoading] = createSignal(false);

    return (
        <>
            <InnerCard title="Export wallet state">
                <NiceP>
                    You can export your entire Mutiny Wallet state to a file and
                    import it into a new browser. It usually works!
                </NiceP>
                <NiceP>
                    <strong>Important caveats:</strong> after exporting don't do
                    any operations in the original browser. If you do, you'll
                    need to export again. After a successful import, a best
                    practice is to clear the state of the original browser just
                    to make sure you don't create conflicts.
                </NiceP>
                <div />
                <VStack>
                    <Button onClick={handleSave}>Save State As File</Button>
                    <Button onClick={uploadFile}>Import State From File</Button>
                </VStack>
            </InnerCard>
            <ConfirmDialog
                loading={confirmLoading()}
                open={confirmOpen()}
                onConfirm={importJson}
                onCancel={() => setConfirmOpen(false)}
            >
                Do you want to replace your state with {files()[0].name}?
            </ConfirmDialog>
        </>
    );
}
