import { Dialog } from "@kobalte/core";
import { JSX } from "solid-js";
import { Button, LargeHeader } from "~/components/layout";
import { DIALOG_CONTENT, DIALOG_POSITIONER } from "~/styles/dialogs";

type SuccessModalProps = {
    title: string;
    open: boolean;
    setOpen: (open: boolean) => void;
    children?: JSX.Element;
    onConfirm?: () => void;
    confirmText?: string;
};

export function SuccessModal(props: SuccessModalProps) {
    const onNice = () => {
        props.onConfirm ? props.onConfirm() : props.setOpen(false);
    };

    // <div class="flex flex-col items-center gap-8 h-full max-w-[400px]">
    return (
        <Dialog.Root open={props.open} onOpenChange={props.setOpen}>
            <Dialog.Portal>
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT}>
                        <div class="flex justify-between items-center mb-2">
                            <Dialog.Title>
                                <LargeHeader>{props.title}</LargeHeader>
                            </Dialog.Title>
                            <div />
                        </div>
                        <Dialog.Description class="flex flex-col items-center justify-center gap-8 pb-4 h-full w-full max-w-[400px] mx-auto">
                            {props.children}
                        </Dialog.Description>
                        <div class="w-full flex max-w-[300px] mx-auto">
                            <Button onClick={onNice}>
                                {props.confirmText ?? "Nice"}
                            </Button>
                        </div>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
