import { Button, InnerCard, NiceP, VStack } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";
import { downloadTextFile } from "~/utils/download";

export function Logs() {
    const [state, _] = useMegaStore();

    async function handleSave() {
        const logs = await state.mutiny_wallet?.get_logs();
        downloadTextFile(logs.join("") || "", "mutiny-logs.txt", "text/plain");
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
