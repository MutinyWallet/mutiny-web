import { Dialog } from "@kobalte/core";
import { ParentComponent, createSignal } from "solid-js";
import { DIALOG_CONTENT, DIALOG_POSITIONER, OVERLAY } from "./DetailsModal";
import { ModalCloseButton, SmallHeader } from "./layout";
import { ExternalLink } from "./layout/ExternalLink";
import { getExistingSettings } from "~/logic/mutinyWalletSetup";

export function BetaWarningModal() {
    return (
        <WarningModal title="Warning: beta software" linkText="Why?">
            <p>
                We're so glad you're here. But we do want to warn you: Mutiny
                Wallet is in beta, and there are still bugs and rough edges.
            </p>
            <p>
                For instance, Mutiny currently doesn't have seed restore
                functionality or an easy way to do lightning backups.
            </p>
            <p>
                Please be careful and don't put more money into Mutiny than
                you're willing to lose.
            </p>
            <p>
                <ExternalLink href="https://github.com/MutinyWallet/mutiny-web/wiki/Mutiny-Beta-Readme">
                    Learn more about the beta
                </ExternalLink>
            </p>
            <p class="small text-neutral-400">
                If you want to use pretend money to test out Mutiny without
                risk,{" "}
                <ExternalLink href="https://blog.mutinywallet.com/mutiny-wallet-signet-release/">
                    check out our Signet version.
                </ExternalLink>
            </p>
        </WarningModal>
    );
}

export const WarningModal: ParentComponent<{
    linkText: string;
    title: string;
}> = (props) => {
    const [open, setOpen] = createSignal(
        localStorage.getItem("betaWarned") !== "true" &&
        getExistingSettings().network === "bitcoin"
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
