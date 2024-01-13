import initMutinyWallet, { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { createSignal } from "solid-js";

import { Button, ConfirmDialog, showToast } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify } from "~/utils";

export function DeleteEverything(props: { emergency?: boolean }) {
    const i18n = useI18n();
    const [state, actions] = useMegaStore();

    async function confirmReset() {
        setConfirmOpen(true);
    }

    const [confirmOpen, setConfirmOpen] = createSignal(false);
    const [confirmLoading, setConfirmLoading] = createSignal(false);

    async function resetNode() {
        try {
            setConfirmLoading(true);

            localStorage.removeItem("profile_setup_stage");

            // If we're in a context where the wallet is loaded we want to use the regular action to delete it
            // Otherwise we just call the import_json method directly
            if (state.mutiny_wallet && !props.emergency) {
                try {
                    await actions.deleteMutinyWallet();
                } catch (e) {
                    // If we can't stop we want to keep going
                    console.error(e);
                }
            } else {
                // If there's no mutiny_wallet loaded we might need to initialize WASM
                await initMutinyWallet();
                await MutinyWallet.import_json("{}");
            }

            showToast({
                title: i18n.t(
                    "settings.emergency_kit.delete_everything.deleted"
                ),
                description: i18n.t(
                    "settings.emergency_kit.delete_everything.deleted_description"
                )
            });

            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
        } catch (e) {
            console.error(e);
            showToast(eify(e));
        } finally {
            setConfirmOpen(false);
            setConfirmLoading(false);
        }
    }

    return (
        <>
            <Button onClick={confirmReset}>
                {i18n.t("settings.emergency_kit.delete_everything.delete")}
            </Button>
            <ConfirmDialog
                loading={confirmLoading()}
                open={confirmOpen()}
                onConfirm={resetNode}
                onCancel={() => setConfirmOpen(false)}
            >
                {i18n.t("settings.emergency_kit.delete_everything.confirm")}
            </ConfirmDialog>
        </>
    );
}
