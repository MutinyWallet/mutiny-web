import { createForm } from "@modular-forms/solid";
import { createMemo, createSignal, Show } from "solid-js";

import {
    BackLink,
    Button,
    ButtonLink,
    DefaultMain,
    InfoBox,
    LargeHeader,
    MutinyWalletGuard,
    NavBar,
    NiceP,
    TextField,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify } from "~/utils";

type EncryptPasswordForm = {
    existingPassword: string;
    password: string;
    confirmPassword: string;
};

export function Encrypt() {
    const i18n = useI18n();
    const [store, _actions] = useMegaStore();
    const [error, setError] = createSignal<Error>();
    const [loading, setLoading] = createSignal(false);

    const [encryptPasswordForm, { Form, Field }] =
        createForm<EncryptPasswordForm>({
            initialValues: {
                existingPassword: "",
                password: "",
                confirmPassword: ""
            },
            validate: (values) => {
                setError(undefined);
                const errors: Record<string, string> = {};
                if (values.password !== values.confirmPassword) {
                    errors.confirmPassword = i18n.t(
                        "settings.encrypt.error_match"
                    );
                } else if (values.password === values.existingPassword) {
                    errors.password = i18n.t(
                        "settings.encrypt.error_same_as_existingpassword"
                    );
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

            // await timeout(1000);
            window.location.href = "/";
        } catch (e) {
            console.error(e);
            setError(eify(e));
            setLoading(false);
        }
    };

    const encryptButtonDisabled = createMemo(() => {
        return (
            !encryptPasswordForm.dirty ||
            encryptPasswordForm.invalid ||
            !!error()
        );
    });

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <BackLink href="/settings" title={i18n.t("settings.header")} />
                <LargeHeader>
                    {`${i18n.t("settings.encrypt.header")} ${i18n.t(
                        "settings.encrypt.optional"
                    )}`}
                </LargeHeader>
                <VStack>
                    <NiceP>
                        {i18n.t("settings.encrypt.hot_wallet_warning")}
                    </NiceP>
                    <NiceP>{i18n.t("settings.encrypt.password_tip")}</NiceP>
                    <Form onSubmit={handleFormSubmit}>
                        <VStack>
                            <Field name="existingPassword">
                                {(field, props) => (
                                    <TextField
                                        {...props}
                                        {...field}
                                        type="password"
                                        label={`${i18n.t(
                                            "settings.encrypt.existing_password"
                                        )} ${i18n.t(
                                            "settings.encrypt.optional"
                                        )}`}
                                        placeholder={i18n.t(
                                            "settings.encrypt.existing_password"
                                        )}
                                        caption={i18n.t(
                                            "settings.encrypt.existing_password_caption"
                                        )}
                                    />
                                )}
                            </Field>
                            <Field name="password">
                                {(field, props) => (
                                    <TextField
                                        {...props}
                                        {...field}
                                        type="password"
                                        label={i18n.t(
                                            "settings.encrypt.new_password_label"
                                        )}
                                        placeholder={i18n.t(
                                            "settings.encrypt.new_password_placeholder"
                                        )}
                                        caption={i18n.t(
                                            "settings.encrypt.new_password_caption"
                                        )}
                                    />
                                )}
                            </Field>
                            <Field name="confirmPassword">
                                {(field, props) => (
                                    <TextField
                                        {...props}
                                        {...field}
                                        type="password"
                                        label={i18n.t(
                                            "settings.encrypt.confirm_password_label"
                                        )}
                                        placeholder={i18n.t(
                                            "settings.encrypt.confirm_password_placeholder"
                                        )}
                                    />
                                )}
                            </Field>
                            <Show when={error()}>
                                <InfoBox accent="red">
                                    {error()?.message}
                                </InfoBox>
                            </Show>
                            <div />
                            <Button
                                intent="blue"
                                disabled={encryptButtonDisabled()}
                                loading={loading()}
                            >
                                {i18n.t("settings.encrypt.encrypt")}
                            </Button>
                        </VStack>
                    </Form>
                    <ButtonLink href="/" intent="green">
                        {i18n.t("settings.encrypt.skip")}
                    </ButtonLink>
                </VStack>
            </DefaultMain>
            <NavBar activeTab="settings" />
        </MutinyWalletGuard>
    );
}
