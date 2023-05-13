
import { Dialog } from "@kobalte/core";
import { JSX } from "solid-js";
import { Button, LargeHeader } from "~/components/layout";
import close from "~/assets/icons/close.svg";
import { DIALOG_CONTENT, DIALOG_POSITIONER } from "~/styles/dialogs";

type FullscreenModalProps = {
    title: string,
    open: boolean,
    setOpen: (open: boolean) => void,
    children?: JSX.Element,
    onConfirm?: () => void
    confirmText?: string
}

export function FullscreenModal(props: FullscreenModalProps) {
    return (
        <Dialog.Root open={props.open} onOpenChange={(isOpen) => props.setOpen(isOpen)}>
            <Dialog.Portal>
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT}>
                        <div class="flex justify-between items-center mb-2">
                            <Dialog.Title>
                                <LargeHeader>
                                    {props.title}
                                </LargeHeader>
                            </Dialog.Title>
                            <Dialog.CloseButton class="p-2 hover:bg-white/10 rounded-lg active:bg-m-blue">
                                <img src={close} alt="Close" />
                            </Dialog.CloseButton>
                        </div>
                        <Dialog.Description class="flex flex-col gap-4">
                            {props.children}
                        </Dialog.Description>
                        <div class="w-full flex">
                            <Button onClick={(_) => props.onConfirm ? props.onConfirm() : props.setOpen(false)}>{props.confirmText ?? "Nice"}</Button>
                        </div>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root >
    )
}