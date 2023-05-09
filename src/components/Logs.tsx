import { Button, Card, NiceP, VStack } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";
import { downloadTextFile } from "~/utils/download";

export function Logs() {
    const [state, _] = useMegaStore()

    async function handleSave() {
        const logs = await state.mutiny_wallet?.get_logs()
        downloadTextFile(logs.join() || "", "mutiny-logs.txt", "text/plain")
    }

    return (
        <Card>
            <VStack>
                <NiceP>Something screwy going on? Check out the logs!</NiceP>
                <Button onClick={handleSave}>Download Logs</Button>
            </VStack>
        </Card>

    )
}