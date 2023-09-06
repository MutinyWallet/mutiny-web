import { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { createSignal, Show } from "solid-js";

import {
    Button,
    InfoBox,
    InnerCard,
    NiceP,
    SimpleDialog,
    TextField,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { downloadTextFile, eify } from "~/utils";

export function Logs() {
    const i18n = useI18n();

    // Create state for errors, password and dialog visibility
    const [error, setError] = createSignal<Error>();
    const [exportDecrypt, setExportDecrypt] = createSignal(false);
    const [password, setPassword] = createSignal<string>();

    async function handleSave() {
        try {
            setError(undefined);
            const logs = await MutinyWallet.get_logs(password()); // Use password if required
            await downloadTextFile(
                logs.join("") || "",
                "mutiny-logs.txt",
                "text/plain"
            );
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

    function savePassword(e: Event) {
        e.preventDefault();
        handleSave();
        setPassword(undefined); // clear password after use
        setExportDecrypt(false); // close the dialog
    }

    function noop() {
        // noop
    }

    return (
        <InnerCard title={i18n.t("settings.emergency_kit.logs.title")}>
            <VStack>
                <NiceP>
                    {i18n.t("settings.emergency_kit.logs.something_screwy")}
                </NiceP>
                <Button intent="green" onClick={handleSave}>
                    {i18n.t("settings.emergency_kit.logs.download_logs")}
                </Button>
            </VStack>
            <Show when={error()}>
                <InfoBox accent="red">{error()?.message}</InfoBox>
            </Show>
            <SimpleDialog
                title={i18n.t("settings.emergency_kit.logs.password")}
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
                                "settings.emergency_kit.logs.confirm_password_label"
                            )}
                        </Button>
                    </div>
                </form>
            </SimpleDialog>
        </InnerCard>
    );
}
