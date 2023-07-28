import { Dialog } from "@kobalte/core";
import { ParentComponent } from "solid-js";
import { Button, SmallHeader } from "./layout";
import { useI18n } from "~/i18n/context";

const OVERLAY = "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm";
const DIALOG_POSITIONER = "fixed inset-0 z-50 flex items-center justify-center";
const DIALOG_CONTENT =
    "w-[80vw] max-w-[400px] p-4 bg-gray/50 backdrop-blur-md shadow-xl rounded-xl border border-white/10";

// TODO: implement this like toast so it's just one global confirm and I can call it with `confirm({ title: "Are you sure?", description: "This will delete your node" })`
export const ConfirmDialog: ParentComponent<{
    open: boolean;
    loading: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}> = (props) => {
    const i18n = useI18n();
    return (
        <Dialog.Root open={props.open} onOpenChange={props.onCancel}>
            <Dialog.Portal>
                <Dialog.Overlay class={OVERLAY} />
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT}>
                        <div class="flex justify-between mb-2">
                            <Dialog.Title>
                                <SmallHeader>
                                    {i18n.t(
                                        "modals.confirm_dialog.are_you_sure"
                                    )}
                                </SmallHeader>
                            </Dialog.Title>
                        </div>
                        <Dialog.Description class="flex flex-col gap-4">
                            {props.children}
                            <div class="flex gap-4 w-full justify-end">
                                <Button onClick={props.onCancel}>
                                    {i18n.t("modals.confirm_dialog.cancel")}
                                </Button>
                                <Button
                                    intent="red"
                                    onClick={props.onConfirm}
                                    loading={props.loading}
                                    disabled={props.loading}
                                >
                                    {i18n.t("modals.confirm_dialog.confirm")}
                                </Button>
                            </div>
                        </Dialog.Description>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
