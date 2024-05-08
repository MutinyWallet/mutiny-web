import { useNavigate } from "@solidjs/router";
import { Users } from "lucide-solid";
import { createSignal } from "solid-js";

import { ButtonCard, NiceP, SimpleDialog } from "~/components/layout";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function FederationPopup() {
    const [state, actions, _sw] = useMegaStore();
    const [
        showFederationExpirationWarning,
        setShowFederationExpirationWarning
    ] = createSignal(!state.expiration_warning_seen);

    const i18n = useI18n();
    const navigate = useNavigate();

    return (
        <SimpleDialog
            title={i18n.t("activity.federation_message")}
            open={showFederationExpirationWarning()}
            setOpen={(open: boolean) => {
                if (!open) {
                    setShowFederationExpirationWarning(false);
                    actions.clearExpirationWarning();
                }
            }}
        >
            <NiceP>{state.expiration_warning?.expiresMessage}</NiceP>
            <ButtonCard
                onClick={() => {
                    actions.clearExpirationWarning();
                    setShowFederationExpirationWarning(false);
                    navigate("/settings/federations");
                }}
            >
                <div class="flex items-center gap-2">
                    <Users class="inline-block text-m-red" />
                    <NiceP>{i18n.t("profile.manage_federation")}</NiceP>
                </div>
            </ButtonCard>
        </SimpleDialog>
    );
}
