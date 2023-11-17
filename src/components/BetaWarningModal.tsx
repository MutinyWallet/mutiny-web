import { Dialog } from "@kobalte/core";
import { ParentComponent } from "solid-js";

import {
    DIALOG_CONTENT,
    DIALOG_POSITIONER,
    ExternalLink,
    ModalCloseButton,
    OVERLAY,
    SmallHeader
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function BetaWarningModal() {
    const i18n = useI18n();
    return (
        <WarningModal
            title={i18n.t("modals.beta_warning.title")}
            linkText={i18n.t("common.why")}
        >
            <p>{i18n.t("modals.beta_warning.be_careful")}</p>
            <p>
                <ExternalLink href="https://github.com/MutinyWallet/mutiny-web/wiki/Mutiny-Beta-Readme">
                    {i18n.t("modals.beta_warning.beta_link")}
                </ExternalLink>
            </p>
            <p class="small text-neutral-400">
                {i18n.t("modals.beta_warning.pretend_money")}{" "}
                <ExternalLink href="https://blog.mutinywallet.com/mutiny-wallet-signet-release/">
                    {i18n.t("modals.beta_warning.signet_link")}
                </ExternalLink>
            </p>
        </WarningModal>
    );
}

const WarningModal: ParentComponent<{
    linkText: string;
    title: string;
}> = (props) => {
    const [state, actions] = useMegaStore();

    function close() {
        actions.setBetaWarned();
    }

    return (
        <Dialog.Root
            open={!state.betaWarned && state.settings?.network === "bitcoin"}
            onOpenChange={close}
        >
            <Dialog.Portal>
                <Dialog.Overlay class={OVERLAY} />
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT}>
                        <div class="p-4">
                            <Dialog.Title class="mb-2 flex items-center justify-between">
                                <SmallHeader>{props.title}</SmallHeader>
                                <Dialog.CloseButton>
                                    <ModalCloseButton />
                                </Dialog.CloseButton>
                            </Dialog.Title>
                            <Dialog.Description class="flex flex-col gap-4">
                                <div>{props.children}</div>
                            </Dialog.Description>
                        </div>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
