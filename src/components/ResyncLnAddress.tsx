import { createSignal } from "solid-js";

import { Button, InnerCard, NiceP, VStack } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function ResyncLnAddress() {
    const i18n = useI18n();
    const [_state, _actions, sw] = useMegaStore();
    const [loading, setLoading] = createSignal(false);

    async function resync() {
        try {
            setLoading(true);
            await sw.resync_lightning_address();
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    return (
        <InnerCard>
            <VStack>
                <NiceP>{i18n.t("error.resync.lightning_address")}</NiceP>
                <Button intent="red" onClick={resync} loading={loading()}>
                    {i18n.t("error.resync.resync_ln")}
                </Button>
            </VStack>
        </InnerCard>
    );
}
