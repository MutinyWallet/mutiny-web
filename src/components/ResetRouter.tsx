import { Button, InnerCard, NiceP, VStack } from "~/components/layout";
import { useMegaStore } from "~/state/megaStore";
import { useI18n } from "~/i18n/context";

export function ResetRouter() {
    const i18n = useI18n();
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
                <NiceP>{i18n.t("error.reset_router.payments_failing")}</NiceP>
                <Button intent="red" onClick={reset}>
                    {i18n.t("error.reset_router.reset_router")}
                </Button>
            </VStack>
        </InnerCard>
    );
}
