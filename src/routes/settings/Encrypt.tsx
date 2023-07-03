import {
    Button,
    DefaultMain,
    LargeHeader,
    NiceP,
    MutinyWalletGuard,
    SafeArea,
    VStack,
    ButtonLink
} from "~/components/layout";
import NavBar from "~/components/NavBar";
import { useMegaStore } from "~/state/megaStore";
import { Show, createSignal } from "solid-js";
import { BackLink } from "~/components/layout/BackLink";
import { createForm } from "@modular-forms/solid";
import { TextField } from "~/components/layout/TextField";
import { timeout } from "~/utils/timeout";
import eify from "~/utils/eify";
import { InfoBox } from "~/components/InfoBox";

type EncryptPasswordForm = {
    existingPassword: string;
    password: string;
    confirmPassword: string;
};

export default function Encrypt() {
    const [store, _actions] = useMegaStore();
    const [error, setError] = createSignal<Error>();
    const [loading, setLoading] = createSignal(false);

    const [_encryptPasswordForm, { Form, Field }] =
        createForm<EncryptPasswordForm>({
            initialValues: {
                existingPassword: "",
                password: "",
                confirmPassword: ""
            },
            validate: (values) => {
                const errors: Record<string, string> = {};
                if (values.password !== values.confirmPassword) {
                    errors.confirmPassword = "Passwords do not match";
                }
                return errors;
            }
        });

    const handleFormSubmit = async (f: EncryptPasswordForm) => {
        setLoading(true);
        try {
            await store.mutiny_wallet?.change_password(
                f.existingPassword === "" ? undefined : f.existingPassword,
                f.password === "" ? undefined : f.password
            );

            await timeout(1000);
            window.location.href = "/";
        } catch (e) {
            console.error(e);
            setError(eify(e));
            setLoading(false);
        }
    };

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink href="/settings" title="Settings" />
                    <LargeHeader>
                        Encrypt your seed words (optional)
                    </LargeHeader>
                    <VStack>
                        <NiceP>
                            Mutiny is a "hot wallet" so it needs your seed word
                            to operate, but you can optionally encrypt those
                            words with a password.
                        </NiceP>
                        <NiceP>
                            That way, if someone gets access to your browser,
                            they still won't have access to your funds.
                        </NiceP>
                        <Form onSubmit={handleFormSubmit}>
                            <VStack>
                                <Field name="existingPassword">
                                    {(field, props) => (
                                        <TextField
                                            {...props}
                                            {...field}
                                            type="password"
                                            label="Existing Password (optional)"
                                            placeholder="Existing password"
                                            caption="Leave blank if you haven't set a password yet."
                                        />
                                    )}
                                </Field>
                                <Field name="password">
                                    {(field, props) => (
                                        <TextField
                                            {...props}
                                            {...field}
                                            type="password"
                                            label="Password"
                                            placeholder="Enter a password"
                                            caption="This password will be used to encrypt your seed words. If you forget it, you will need to re-enter your seed words to access your funds. You did write down your seed words, right?"
                                        />
                                    )}
                                </Field>
                                <Field name="confirmPassword">
                                    {(field, props) => (
                                        <TextField
                                            {...props}
                                            {...field}
                                            type="password"
                                            label="Confirm Password"
                                            placeholder="Enter the same password"
                                        />
                                    )}
                                </Field>
                                <Show when={error()}>
                                    <InfoBox accent="red">
                                        {error()?.message}
                                    </InfoBox>
                                </Show>
                                <div />
                                <Button intent="blue" loading={loading()}>
                                    Encrypt
                                </Button>
                            </VStack>
                        </Form>
                        <ButtonLink href="/settings" intent="green">
                            Skip
                        </ButtonLink>
                    </VStack>
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
