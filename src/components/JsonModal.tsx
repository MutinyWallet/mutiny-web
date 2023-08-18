import { Dialog } from "@kobalte/core";
import { createMemo, JSX } from "solid-js";

import {
    CopyButton,
    DIALOG_CONTENT,
    DIALOG_POSITIONER,
    ModalCloseButton,
    OVERLAY,
    SmallHeader
} from "~/components";
import { useI18n } from "~/i18n/context";

export function JsonModal(props: {
    title: string;
    open: boolean;
    plaintext?: string;
    data?: unknown;
    setOpen: (open: boolean) => void;
    children?: JSX.Element;
}) {
    const i18n = useI18n();
    const json = createMemo(() =>
        props.plaintext ? props.plaintext : JSON.stringify(props.data, null, 2)
    );

    return (
        <Dialog.Root open={props.open} onOpenChange={props.setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay class={OVERLAY} />
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT}>
                        <div class="mb-2 flex items-center justify-between">
                            <Dialog.Title>
                                <SmallHeader>{props.title}</SmallHeader>
                            </Dialog.Title>
                            <Dialog.CloseButton>
                                <ModalCloseButton />
                            </Dialog.CloseButton>
                        </div>
                        <Dialog.Description class="flex flex-col items-center gap-4">
                            <div class="max-h-[50vh] overflow-y-scroll rounded-xl bg-white/5 p-4 disable-scrollbars">
                                <pre class="whitespace-pre-wrap break-all">
                                    {json()}
                                </pre>
                            </div>
                            {props.children}
                            <CopyButton
                                title={i18n.t("common.copy")}
                                text={json()}
                            />
                        </Dialog.Description>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
