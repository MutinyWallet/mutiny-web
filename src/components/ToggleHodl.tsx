import { Button, InnerCard, NiceP, VStack } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function ToggleHodl() {
    const i18n = useI18n();
    const [state, actions] = useMegaStore();

    async function toggle() {
        try {
            await actions.toggleHodl();
            window.location.href = "/";
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <InnerCard
            title={i18n.t("settings.admin.kitchen_sink.enable_zaps_to_hodl")}
        >
            <VStack>
                <NiceP>
                    {i18n.t("settings.admin.kitchen_sink.zaps_to_hodl_desc")}
                </NiceP>

                <Button
                    intent={state.should_zap_hodl ? "green" : "red"}
                    onClick={toggle}
                >
                    {state.should_zap_hodl
                        ? i18n.t(
                              "settings.admin.kitchen_sink.zaps_to_hodl_disable"
                          )
                        : i18n.t(
                              "settings.admin.kitchen_sink.zaps_to_hodl_enable"
                          )}
                </Button>
            </VStack>
        </InnerCard>
    );
}
