import { Button, InnerCard, NiceP, VStack } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function ToggleReportDiagnostics() {
    const i18n = useI18n();
    const [state, actions] = useMegaStore();

    async function toggle() {
        try {
            await actions.toggleReportDiagnostics();
            window.location.href = "/";
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <InnerCard
            title={i18n.t(
                "settings.admin.kitchen_sink.enable_report_diagnostics"
            )}
        >
            <VStack>
                <NiceP>
                    {i18n.t(
                        "settings.admin.kitchen_sink.report_diagnostics_desc"
                    )}
                </NiceP>

                <Button
                    intent={state.report_diagnostics ? "green" : "red"}
                    onClick={toggle}
                >
                    {state.report_diagnostics
                        ? i18n.t(
                              "settings.admin.kitchen_sink.report_diagnostics_disable"
                          )
                        : i18n.t(
                              "settings.admin.kitchen_sink.report_diagnostics_enable"
                          )}
                </Button>
            </VStack>
        </InnerCard>
    );
}
