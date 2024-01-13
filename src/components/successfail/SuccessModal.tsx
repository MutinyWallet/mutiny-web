import { Dialog } from "@kobalte/core";
import { JSX } from "solid-js";

import { Button } from "~/components";
import { useI18n } from "~/i18n/context";
import { DIALOG_CONTENT, DIALOG_POSITIONER } from "~/styles/dialogs";

type SuccessModalProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    children?: JSX.Element;
    onConfirm?: () => void;
    confirmText?: string;
};

export function SuccessModal(props: SuccessModalProps) {
    const i18n = useI18n();
    const onNice = () => {
        props.onConfirm ? props.onConfirm() : props.setOpen(false);
    };

    return (
        <Dialog.Root open={props.open} onOpenChange={props.setOpen}>
            <Dialog.Portal>
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT}>
                        <Dialog.Description class="mx-auto flex h-full w-full max-w-[400px] flex-col items-center justify-center gap-6">
                            {props.children}
                        </Dialog.Description>
                        <div class="mx-auto flex w-full max-w-[300px]">
                            <Button onClick={onNice} intent="inactive">
                                {props.confirmText ??
                                    `${i18n.t("common.nice")}`}
                            </Button>
                        </div>
                        <div class="py-2" />
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
