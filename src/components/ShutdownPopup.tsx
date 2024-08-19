import { createSignal } from "solid-js";

import { ExternalLink, NiceP, SimpleDialog } from "~/components/layout";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function ShutdownPopup() {
    const [state, actions, _sw] = useMegaStore();
    const selfHosted =
        state.settings?.selfhosted && state.settings?.selfhosted === "true";
    const [showShutdownWarning, setShowShutdownWarning] = createSignal(
        !selfHosted && !state.shutdown_warning_seen
    );

    const i18n = useI18n();

    return (
        <SimpleDialog
            title={`${i18n.t("home.shutdown.title")}`}
            open={showShutdownWarning()}
            setOpen={(open: boolean) => {
                if (!open) {
                    setShowShutdownWarning(false);
                    actions.clearShutdownWarning();
                }
            }}
        >
            <NiceP>{i18n.t("home.shutdown.message")}</NiceP>
            <NiceP>
                <ExternalLink href="https://blog.mutinywallet.com/mutiny-timeline/">
                    Learn more
                </ExternalLink>
            </NiceP>
        </SimpleDialog>
    );
}
