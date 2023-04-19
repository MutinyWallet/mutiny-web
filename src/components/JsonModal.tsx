import { Dialog } from "@kobalte/core";
import { JSX, createMemo } from "solid-js";
import { Button, SmallHeader } from "~/components/layout";
import { useCopy } from "~/utils/useCopy";

const OVERLAY = "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
const DIALOG_POSITIONER = "fixed inset-0 z-50 flex items-center justify-center"
const DIALOG_CONTENT = "max-w-[600px] max-h-screen-safe p-4 bg-gray/50 backdrop-blur-md shadow-xl rounded-xl border border-white/10"

export function JsonModal(props: { title: string, open: boolean, data?: unknown, setOpen: (open: boolean) => void, children?: JSX.Element }) {
    const json = createMemo(() => JSON.stringify(props.data, null, 2));

    const [copy, copied] = useCopy({ copiedTimeout: 1000 });

    return (
        <Dialog.Root isOpen={props.open} onOpenChange={(isOpen) => props.setOpen(isOpen)}>
            <Dialog.Portal>
                <Dialog.Overlay class={OVERLAY} />
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT}>
                        <div class="flex justify-between mb-2">
                            <Dialog.Title>
                                <SmallHeader>
                                    {props.title}
                                </SmallHeader>
                            </Dialog.Title>
                            <Dialog.CloseButton>
                                <code>X</code>
                            </Dialog.CloseButton>
                        </div>
                        <Dialog.Description class="flex flex-col gap-4">
                            <div class="bg-white/10 rounded-xl max-h-[50vh] overflow-y-scroll disable-scrollbars p-4">
                                <pre class="whitespace-pre-wrap break-all">
                                    {json()}
                                </pre>
                            </div>
                            {props.children}
                            <Button onClick={(_) => copy(json() ?? "")}>{copied() ? "Copied" : "Copy"}</Button>
                            <Button onClick={(_) => props.setOpen(false)}>Close</Button>
                        </Dialog.Description>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root >
    )
}