import { Dialog } from "@kobalte/core";
import { ButtonLink, SmallHeader } from "~/components/layout";

const OVERLAY = "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
const DIALOG_POSITIONER = "fixed inset-0 z-50 flex items-center justify-center"
const DIALOG_CONTENT = "w-[80vw] max-w-[400px] p-4 bg-gray/50 backdrop-blur-md shadow-xl rounded-xl border border-white/10"

export function SentModal(props: { details?: { nice: string } }) {

    return (
        <Dialog.Root isOpen={!!props.details}>
            <Dialog.Portal>
                <Dialog.Overlay class={OVERLAY} />
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT}>
                        <div class="flex justify-between mb-2">
                            <Dialog.Title>
                                <SmallHeader>
                                    Sent!
                                </SmallHeader>
                            </Dialog.Title>
                            <Dialog.CloseButton class="dialog__close-button">
                                <code>X</code>
                            </Dialog.CloseButton>
                        </div>
                        <Dialog.Description class="flex flex-col gap-4">
                            <pre>
                                {JSON.stringify(props.details)}
                            </pre>
                            <ButtonLink href="/">Nice</ButtonLink>
                        </Dialog.Description>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root >
    )
}