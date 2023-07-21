import { useMegaStore } from "~/state/megaStore";
import {
    Button,
    InnerCard,
    NiceP,
    SimpleDialog,
    VStack
} from "~/components/layout";
import { Show, createSignal } from "solid-js";
import eify from "~/utils/eify";
import { showToast } from "./Toaster";
import { downloadTextFile } from "~/utils/download";
import { createFileUploader } from "@solid-primitives/upload";
import { ConfirmDialog } from "./Dialog";
import initMutinyWallet, { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { InfoBox } from "./InfoBox";
import { TextField } from "./layout/TextField";
import { useI18n } from "~/i18n/context";

export function ImportExport(props: { emergency?: boolean }) {
    const i18n = useI18n();
    const [state, _] = useMegaStore();

    const [error, setError] = createSignal<Error>();
    const [exportDecrypt, setExportDecrypt] = createSignal(false);
    const [password, setPassword] = createSignal("");

    async function handleSave() {
        try {
            setError(undefined);
            const json = await MutinyWallet.export_json();
            downloadTextFile(json || "", "mutiny-state.json");
        } catch (e) {
            console.error(e);
            const err = eify(e);
            if (err.message === "Incorrect password entered.") {
                setExportDecrypt(true);
            } else {
                setError(err);
            }
        }
    }

    async function savePassword(e: Event) {
        e.preventDefault();
        try {
            setError(undefined);
            if (!password()) {
                throw new Error(
                    i18n.t(
                        "settings.emergency_kit.import_export.error_password"
                    )
                );
            }
            const json = await MutinyWallet.export_json(password());
            downloadTextFile(json || "", "mutiny-state.json");
        } catch (e) {
            console.error(e);
            setError(eify(e));
        } finally {
            setExportDecrypt(false);
            setPassword("");
        }
    }

    function noop() {
        // noop
    }

    const { files, selectFiles } = createFileUploader();

    async function importJson() {
        setConfirmLoading(true);
        const fileReader = new FileReader();

        try {
            setError(undefined);
            const file: File = files()[0].file;

            const text = await new Promise<string | null>((resolve, reject) => {
                fileReader.onload = (e) => {
                    const result = e.target?.result?.toString();
                    if (result) {
                        resolve(result);
                    } else {
                        reject(
                            new Error(
                                i18n.t(
                                    "settings.emergency_kit.import_export.error_no_text"
                                )
                            )
                        );
                    }
                };
                fileReader.onerror = (_e) =>
                    reject(
                        new Error(
                            i18n.t(
                                "settings.emergency_kit.import_export.error_read_file"
                            )
                        )
                    );
                fileReader.readAsText(file, "UTF-8");
            });

            if (state.mutiny_wallet && !props.emergency) {
                console.log("Mutiny wallet loaded, stopping");
                try {
                    await state.mutiny_wallet.stop();
                } catch (e) {
                    console.error(e);
                    setError(eify(e));
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
            <InnerCard
                title={i18n.t("settings.emergency_kit.import_export.title")}
            >
                <NiceP>
                    {i18n.t("settings.emergency_kit.import_export.tip")}
                </NiceP>
                <NiceP>
                    <strong>
                        {i18n.t(
                            "settings.emergency_kit.import_export.caveat_header"
                        )}
                    </strong>{" "}
                    {i18n.t("settings.emergency_kit.import_export.caveat")}
                </NiceP>
                <div />
                <Show when={error()}>
                    <InfoBox accent="red">{error()?.message}</InfoBox>
                </Show>
                <VStack>
                    <Button onClick={handleSave}>
                        {i18n.t(
                            "settings.emergency_kit.import_export.save_state"
                        )}
                    </Button>
                    <Button onClick={uploadFile}>
                        {i18n.t(
                            "settings.emergency_kit.import_export.import_state"
                        )}
                    </Button>
                </VStack>
            </InnerCard>
            <ConfirmDialog
                loading={confirmLoading()}
                open={confirmOpen()}
                onConfirm={importJson}
                onCancel={() => setConfirmOpen(false)}
            >
                {i18n.t("settings.emergency_kit.import_export.confirm_replace")}{" "}
                {files()[0].name}?
            </ConfirmDialog>
            {/* TODO: this is pretty redundant with the DecryptDialog, could make a shared component */}
            <SimpleDialog
                title={i18n.t(
                    "settings.emergency_kit.import_export.confirm_replace"
                )}
                open={exportDecrypt()}
            >
                <form onSubmit={savePassword}>
                    <div class="flex flex-col gap-4">
                        <TextField
                            name="password"
                            type="password"
                            ref={noop}
                            value={password()}
                            onInput={(e) => setPassword(e.currentTarget.value)}
                            error={""}
                            onBlur={noop}
                            onChange={noop}
                        />
                        <Show when={error()}>
                            <InfoBox accent="red">{error()?.message}</InfoBox>
                        </Show>
                        <Button intent="blue" onClick={savePassword}>
                            {i18n.t(
                                "settings.emergency_kit.import_export.decrypt_wallet"
                            )}
                        </Button>
                    </div>
                </form>
            </SimpleDialog>
        </>
    );
}
