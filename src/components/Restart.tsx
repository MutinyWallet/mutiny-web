import { createSignal } from "solid-js";
import { Button, InnerCard, NiceP, VStack } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";

export function Restart() {
    const [state, _] = useMegaStore();
    const [hasStopped, setHasStopped] = createSignal(false);

    async function toggle() {
        try {
            if (hasStopped()) {
                await state.mutiny_wallet?.start();
                setHasStopped(false);
            } else {
                await state.mutiny_wallet?.stop();
                setHasStopped(true);
            }
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <InnerCard>
            <VStack>
                <NiceP>
                    Something *extra* screwy going on? Stop the nodes!
                </NiceP>
                <Button
                    intent={hasStopped() ? "green" : "red"}
                    onClick={toggle}
                >
                    {hasStopped() ? "Start" : "Stop"}
                </Button>
            </VStack>
        </InnerCard>
    );
}
