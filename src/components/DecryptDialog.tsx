import { Show, createSignal } from "solid-js";
import { Button, SimpleDialog } from "~/components/layout";
import { TextField } from "~/components/layout/TextField";
import { InfoBox } from "~/components/InfoBox";
import { useMegaStore } from "~/state/megaStore";
import eify from "~/utils/eify";
import { A } from "solid-start";

export function DecryptDialog() {
    const [state, actions] = useMegaStore();

    const [password, setPassword] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal("");

    async function decrypt(e: Event) {
        e.preventDefault();
        setLoading(true);
        try {
            await actions.setupMutinyWallet(undefined, password());

            // If we get this far and the state stills wants a password that means the password was wrong
            if (state.needs_password) {
                throw new Error("wrong");
            }
        } catch (e) {
            const err = eify(e);
            console.error(e);
            if (err.message === "wrong") {
                setError("Invalid password");
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
            title="Enter your password"
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
                        Decrypt Wallet
                    </Button>
                </div>
            </form>
            <A class="self-end text-m-grey-400" href="/settings/restore">
                Forgot Password?
            </A>
        </SimpleDialog>
    );
}
