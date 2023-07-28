import { createSignal } from "solid-js";
import { Button, InnerCard, NiceP, VStack } from "~/components/layout";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function Restart() {
    const i18n = useI18n();
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
                <NiceP>{i18n.t("error.restart.title")}</NiceP>
                <Button
                    intent={hasStopped() ? "green" : "red"}
                    onClick={toggle}
                >
                    {hasStopped()
                        ? i18n.t("error.restart.start")
                        : i18n.t("error.restart.stop")}
                </Button>
            </VStack>
        </InnerCard>
    );
}
