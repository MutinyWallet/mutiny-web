import { Dialog } from "@kobalte/core";
import { createSignal, JSXElement, ParentComponent } from "solid-js";

import help from "~/assets/icons/help.svg";
import {
    DIALOG_CONTENT,
    DIALOG_POSITIONER,
    ExternalLink,
    ModalCloseButton,
    OVERLAY,
    SmallHeader
} from "~/components";
import { useI18n } from "~/i18n/context";

export function FeesModal(props: { icon?: boolean }) {
    const i18n = useI18n();
    return (
        <MoreInfoModal
            title={i18n.t("modals.more_info.whats_with_the_fees")}
            linkText={
                props.icon ? (
                    <img src={help} alt="help" class="h-4 w-4 cursor-pointer" />
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
                <button class="font-semibold underline decoration-light-text hover:decoration-white">
                    {props.linkText}
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay class={OVERLAY} />
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT}>
                        <Dialog.Title class="mb-2 flex items-center justify-between">
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
