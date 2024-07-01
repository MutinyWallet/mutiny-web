import { useNavigate } from "@solidjs/router";
import { ArrowLeftRight, ArrowUpRight, Users } from "lucide-solid";
import { createSignal, Show } from "solid-js";

import {
    ButtonCard,
    ExternalLink,
    NiceP,
    SimpleDialog
} from "~/components/layout";
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

    const name = state.expiration_warning?.federationName;

    return (
        <SimpleDialog
            title={`${i18n.t("activity.federation_message")} ${name ? `: ${name}` : ""}`}
            open={showFederationExpirationWarning()}
            setOpen={(open: boolean) => {
                if (!open) {
                    setShowFederationExpirationWarning(false);
                    actions.clearExpirationWarning();
                }
            }}
        >
            <NiceP>
                {state.expiration_warning?.expiresMessage ||
                    i18n.t("home.federations_warn_generic")}
            </NiceP>
            <Show when={!name}>
                <NiceP>
                    <ExternalLink href="https://x.com/MutinyWallet/status/1805346636660429021">
                        {i18n.t("settings.manage_federations.learn_more")}
                    </ExternalLink>
                </NiceP>
            </Show>
            <ButtonCard
                onClick={() => {
                    actions.clearExpirationWarning();
                    setShowFederationExpirationWarning(false);
                    navigate("/swaplightning");
                }}
            >
                <div class="flex items-center gap-2">
                    <ArrowLeftRight class="inline-block text-m-red" />
                    <NiceP>{i18n.t("home.transfer_lightning")}</NiceP>
                </div>
            </ButtonCard>
            <ButtonCard
                onClick={() => {
                    actions.clearExpirationWarning();
                    setShowFederationExpirationWarning(false);
                    navigate("/send");
                }}
            >
                <div class="flex items-center gap-2">
                    <ArrowUpRight class="inline-block text-m-red" />
                    <NiceP>{i18n.t("home.sent_to_another_wallet")}</NiceP>
                </div>
            </ButtonCard>
            <ButtonCard
                onClick={() => {
                    actions.clearExpirationWarning();
                    setShowFederationExpirationWarning(false);
                    navigate("/settings/federations");
                }}
            >
                <div class="flex items-center gap-2">
                    <Users class="inline-block text-m-red" />
                    <NiceP>{i18n.t("profile.leave_federation")}</NiceP>
                </div>
            </ButtonCard>
        </SimpleDialog>
    );
}
