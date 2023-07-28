import { Dialog } from "@kobalte/core";
import { JSX, createMemo } from "solid-js";
import { ModalCloseButton, SmallHeader } from "~/components/layout";
import {
    DIALOG_CONTENT,
    DIALOG_POSITIONER,
    OVERLAY
} from "~/components/DetailsModal";
import { CopyButton } from "./ShareCard";
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
                        <div class="flex justify-between mb-2 items-center">
                            <Dialog.Title>
                                <SmallHeader>{props.title}</SmallHeader>
                            </Dialog.Title>
                            <Dialog.CloseButton>
                                <ModalCloseButton />
                            </Dialog.CloseButton>
                        </div>
                        <Dialog.Description class="flex flex-col gap-4 items-center">
                            <div class="bg-white/5 rounded-xl max-h-[50vh] overflow-y-scroll disable-scrollbars p-4">
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
