import {Button, InnerCard, NiceP, VStack} from "~/components/layout";
import {useMegaStore} from "~/state/megaStore";

export function ResyncOnchain() {
    const [state, _] = useMegaStore();

    async function reset() {
        try {
            await state.mutiny_wallet?.reset_onchain_tracker();
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <InnerCard>
            <VStack>
                <NiceP>
                    On-chain balance seems incorrect? Try re-syncing the on-chain wallet.
                </NiceP>
                <Button intent="red" onClick={reset}>
                    Resync wallet
                </Button>
            </VStack>
        </InnerCard>
    );
}
