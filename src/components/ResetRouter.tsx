import { Button, InnerCard, NiceP, VStack } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";

export function ResetRouter() {
    const [state, _] = useMegaStore();

    async function reset() {
        try {
            await state.mutiny_wallet?.reset_router();
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <InnerCard>
            <VStack>
                <NiceP>
                    Failing to make payments? Try resetting the lightning router.
                </NiceP>
                <Button intent="red" onClick={reset}>
                    Reset Router
                </Button>
            </VStack>
        </InnerCard>
    );
}
