import { Button, InnerCard, NiceP, VStack } from "~/components/layout";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function ResyncOnchain() {
    const i18n = useI18n();
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
                <NiceP>{i18n.t("error.resync.incorrect_balance")}</NiceP>
                <Button intent="red" onClick={reset}>
                    {i18n.t("error.resync.resync_wallet")}
                </Button>
            </VStack>
        </InnerCard>
    );
}
