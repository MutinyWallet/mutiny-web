
import { Dialog } from "@kobalte/core";
import { JSX } from "solid-js";
import { Button, LargeHeader, SmallHeader } from "~/components/layout";
import close from "~/assets/icons/close.svg";

const DIALOG_POSITIONER = "fixed inset-0 safe-top safe-bottom z-50"
const DIALOG_CONTENT = "h-full flex flex-col justify-between p-4 bg-gray/50 backdrop-blur-md bg-black/80"

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
        <Dialog.Root isOpen={props.open} onOpenChange={(isOpen) => props.setOpen(isOpen)}>
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