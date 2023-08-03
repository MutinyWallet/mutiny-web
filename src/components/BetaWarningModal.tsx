import { Dialog } from "@kobalte/core";
import { ParentComponent, createSignal } from "solid-js";
import { DIALOG_CONTENT, DIALOG_POSITIONER, OVERLAY } from "./DetailsModal";
import { ModalCloseButton, SmallHeader } from "./layout";
import { ExternalLink } from "./layout/ExternalLink";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function BetaWarningModal() {
    const i18n = useI18n();
    return (
        <WarningModal
            title={i18n.t("modals.beta_warning.title")}
            linkText={i18n.t("common.why")}
        >
            <p>{i18n.t("translations:modals.beta_warning.beta_warning")}</p>
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

export const WarningModal: ParentComponent<{
    linkText: string;
    title: string;
}> = (props) => {
    const [state, _actions] = useMegaStore();

    const [open, setOpen] = createSignal(
        localStorage.getItem("betaWarned") !== "true" &&
            state.settings?.network === "bitcoin"
    );

    function close() {
        localStorage.setItem("betaWarned", "true");
        setOpen(false);
    }

    return (
        <Dialog.Root open={open()} onOpenChange={close}>
            <Dialog.Portal>
                <Dialog.Overlay class={OVERLAY} />
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT}>
                        <Dialog.Title class="flex justify-between mb-2 items-center">
                            <SmallHeader>{props.title}</SmallHeader>
                            <Dialog.CloseButton>
                                <ModalCloseButton />
                            </Dialog.CloseButton>
                        </Dialog.Title>
                        <Dialog.Description class="flex flex-col gap-4">
                            <div>{props.children}</div>
                        </Dialog.Description>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
