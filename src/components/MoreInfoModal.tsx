import { Dialog } from "@kobalte/core";
import { ParentComponent, createSignal } from "solid-js";
import { DIALOG_CONTENT, DIALOG_POSITIONER, OVERLAY } from "./DetailsModal";
import { ModalCloseButton, SmallHeader } from "./layout";
import { ExternalLink } from "./layout/ExternalLink";

export function FeesModal() {
    return (
        <MoreInfoModal title="What's with the fees?" linkText="Why?">
            <p>
                Mutiny is a self-custodial wallet. To initiate a lightning
                payment we must open a lightning channel, which requires a
                minimum amount and a setup fee.
            </p>
            <p>
                Future payments, both send and recieve, will only incur normal
                network fees and a nominal service fee unless your channel runs
                out of inbound capacity.
            </p>
            <p>
                <ExternalLink href="https://github.com/MutinyWallet/mutiny-web/wiki/Understanding-liquidity">
                    Learn more about liquidity
                </ExternalLink>
            </p>
        </MoreInfoModal>
    );
}

export const MoreInfoModal: ParentComponent<{
    linkText: string;
    title: string;
}> = (props) => {
    const [open, setOpen] = createSignal(false);

    return (
        <Dialog.Root open={open()} onOpenChange={setOpen}>
            <Dialog.Trigger>
                <button class="underline decoration-light-text hover:decoration-white font-semibold">
                    {props.linkText}
                </button>
            </Dialog.Trigger>
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
