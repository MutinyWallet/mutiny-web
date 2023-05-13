import { Button, Card, NiceP, VStack } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";
import { downloadTextFile } from "~/utils/download";

export function Restart() {
    const [state, _] = useMegaStore()

    async function handleStop() {
        const result = await state.mutiny_wallet?.stop()
    }

    return (
        <Card>
            <VStack>
                <NiceP>Something *extra* screwy going on? Stop the nodes!</NiceP>
                <Button onClick={handleStop}>Stop</Button>
            </VStack>
        </Card>

    )
}
