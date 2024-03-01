import { Button, InnerCard, NiceP, VStack } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function ScanFederation() {
    const i18n = useI18n();
    const [state, _] = useMegaStore();

    async function scan() {
        try {
            await state.mutiny_wallet?.recover_federation_backups();
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <InnerCard>
            <VStack>
                <NiceP>{i18n.t("error.scan_federation.incorrect_balance")}</NiceP>
                <Button intent="red" onClick={scan}>
                    {i18n.t("error.scan_federation.scan")}
                </Button>
            </VStack>
        </InnerCard>
    );
}
