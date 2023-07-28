import { Dialog } from "@kobalte/core";
import { ParentComponent, createSignal, JSXElement } from "solid-js";
import { DIALOG_CONTENT, DIALOG_POSITIONER, OVERLAY } from "./DetailsModal";
import { ModalCloseButton, SmallHeader } from "./layout";
import { ExternalLink } from "./layout/ExternalLink";
import help from "~/assets/icons/help.svg";
import { useI18n } from "~/i18n/context";

export function FeesModal(props: { icon?: boolean }) {
    const i18n = useI18n();
    return (
        <MoreInfoModal
            title={i18n.t("modals.more_info.whats_with_the_fees")}
            linkText={
                props.icon ? (
                    <img src={help} alt="help" class="w-4 h-4 cursor-pointer" />
                ) : (
                    i18n.t("common.why")
                )
            }
        >
            <p>{i18n.t("modals.more_info.self_custodial")}</p>
            <p>{i18n.t("modals.more_info.future_payments")}</p>
            <p>
                <ExternalLink href="https://github.com/MutinyWallet/mutiny-web/wiki/Understanding-liquidity">
                    {i18n.t("modals.more_info.liquidity")}
                </ExternalLink>
            </p>
        </MoreInfoModal>
    );
}

export const MoreInfoModal: ParentComponent<{
    linkText: string | JSXElement;
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
