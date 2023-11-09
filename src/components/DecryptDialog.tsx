import { A } from "@solidjs/router";
import { createSignal, Show } from "solid-js";

import { Button, InfoBox, SimpleDialog, TextField } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify } from "~/utils";

export function DecryptDialog() {
    const i18n = useI18n();
    const [state, actions] = useMegaStore();

    const [password, setPassword] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal("");

    async function decrypt(e: Event) {
        e.preventDefault();
        setLoading(true);
        try {
            await actions.setup(password());

            // If we get this far and the state stills wants a password that means the password was wrong
            if (state.needs_password) {
                throw new Error("wrong");
            }
        } catch (e) {
            const err = eify(e);
            console.error(e);
            if (err.message === "wrong") {
                setError(i18n.t("settings.decrypt.error_wrong_password"));
            } else {
                throw e;
            }
        } finally {
            setLoading(false);
        }
    }

    function noop() {
        // noop
    }

    return (
        <SimpleDialog
            title={i18n.t("settings.decrypt.title")}
            // Only show the dialog if we need a password and there's no setup error
            open={state.needs_password && !state.setup_error}
        >
            <form onSubmit={decrypt}>
                <div class="flex flex-col gap-4">
                    <TextField
                        name="password"
                        type="password"
                        ref={noop}
                        value={password()}
                        onInput={(e) => setPassword(e.currentTarget.value)}
                        error={""}
                        onBlur={noop}
                        onChange={noop}
                    />
                    <Show when={error()}>
                        <InfoBox accent="red">{error()}</InfoBox>
                    </Show>
                    <Button intent="blue" loading={loading()} onClick={decrypt}>
                        {i18n.t("settings.decrypt.decrypt_wallet")}
                    </Button>
                </div>
            </form>
            <A class="self-end text-m-grey-400" href="/settings/restore">
                {i18n.t("settings.decrypt.forgot_password_link")}
            </A>
        </SimpleDialog>
    );
}
