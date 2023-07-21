import { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { Button, InnerCard, NiceP, VStack } from "~/components/layout";
import { useI18n } from "~/i18n/context";
import { downloadTextFile } from "~/utils/download";

export function Logs() {
    const i18n = useI18n();
    async function handleSave() {
        try {
            const logs = await MutinyWallet.get_logs();

            downloadTextFile(
                logs.join("") || "",
                "mutiny-logs.txt",
                "text/plain"
            );
        } catch (e) {
            console.error(e);
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
        </InnerCard>
    );
}
