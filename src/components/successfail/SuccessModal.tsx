import { Dialog } from "@kobalte/core";
import { JSX } from "solid-js";
import { Button } from "~/components/layout";
import { DIALOG_CONTENT, DIALOG_POSITIONER } from "~/styles/dialogs";
import { useI18n } from "~/i18n/context";

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

    // <div class="flex flex-col items-center gap-8 h-full max-w-[400px]">
    return (
        <Dialog.Root open={props.open} onOpenChange={props.setOpen}>
            <Dialog.Portal>
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT}>
                        <Dialog.Description class="flex flex-col items-center justify-center gap-6 h-full w-full max-w-[400px] mx-auto">
                            {props.children}
                        </Dialog.Description>
                        <div class="w-full flex max-w-[300px] mx-auto">
                            <Button onClick={onNice} intent="inactive">
                                {props.confirmText ??
                                    `${i18n.t("common.nice")}`}
                            </Button>
                        </div>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
