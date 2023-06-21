import { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { Button, InnerCard, NiceP, VStack } from "~/components/layout";
import { downloadTextFile } from "~/utils/download";

export function Logs() {
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
        <InnerCard title="Download debug logs">
            <VStack>
                <NiceP>Something screwy going on? Check out the logs!</NiceP>
                <Button intent="green" onClick={handleSave}>
                    Download Logs
                </Button>
            </VStack>
        </InnerCard>
    );
}
