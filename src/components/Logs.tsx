import { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { createSignal, Show } from "solid-js";

import { Button, InfoBox, InnerCard, NiceP, VStack } from "~/components";
import { useI18n } from "~/i18n/context";
import { downloadTextFile, eify } from "~/utils";

export function Logs() {
    const i18n = useI18n();

    // Create state for errors, password and dialog visibility
    const [error, setError] = createSignal<Error>();

    async function handleSave() {
        try {
            setError(undefined);
            const logs = await MutinyWallet.get_logs();
            await downloadTextFile(
                logs.join("") || "",
                "mutiny-logs.txt",
                "text/plain"
            );
        } catch (e) {
            console.error(e);
            setError(eify(e));
        }
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
        </InnerCard>
    );
}
