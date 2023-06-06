import { Button, Card, NiceP, VStack } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";

export function Restart() {
    const [state, _] = useMegaStore();

    async function handleStop() {
        await state.mutiny_wallet?.stop();
    }

    return (
        <Card>
            <VStack>
                <NiceP>
                    Something *extra* screwy going on? Stop the nodes!
                </NiceP>
                <Button onClick={handleStop}>Stop</Button>
            </VStack>
        </Card>
    );
}
