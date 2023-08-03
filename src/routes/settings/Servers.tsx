import { createForm, url } from "@modular-forms/solid";
import { TextField } from "~/components/layout/TextField";
import {
    MutinyWalletSettingStrings,
    setSettings
} from "~/logic/mutinyWalletSetup";
import {
    Button,
    Card,
    DefaultMain,
    LargeHeader,
    MutinyWalletGuard,
    NiceP,
    SafeArea
} from "~/components/layout";
import { showToast } from "~/components/Toaster";
import eify from "~/utils/eify";
import { ExternalLink } from "~/components/layout/ExternalLink";
import { BackLink } from "~/components/layout/BackLink";
import NavBar from "~/components/NavBar";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function SettingsStringsEditor() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();
    const [settingsForm, { Form, Field }] =
        createForm<MutinyWalletSettingStrings>({
            initialValues: state.settings
        });

    async function handleSubmit(values: MutinyWalletSettingStrings) {
        try {
            await setSettings(values);
            window.location.reload();
        } catch (e) {
            console.error(e);
            showToast(eify(e));
        }
        console.log(values);
    }

    return (
        <Card title={i18n.t("settings.servers.title")}>
            <Form onSubmit={handleSubmit} class="flex flex-col gap-4">
                <NiceP>{i18n.t("settings.servers.caption")}</NiceP>
                <ExternalLink href="https://github.com/MutinyWallet/mutiny-web/wiki/Self-hosting">
                    {i18n.t("settings.servers.link")}
                </ExternalLink>
                <div />
                <Field
                    name="proxy"
                    validate={[url(i18n.t("settings.servers.error_proxy"))]}
                >
                    {(field, props) => (
                        <TextField
                            {...props}
                            value={field.value}
                            error={field.error}
                            label={i18n.t("settings.servers.proxy_label")}
                            caption={i18n.t("settings.servers.proxy_caption")}
                        />
                    )}
                </Field>
                <Field
                    name="esplora"
                    validate={[url(i18n.t("settings.servers.error_esplora"))]}
                >
                    {(field, props) => (
                        <TextField
                            {...props}
                            value={field.value}
                            error={field.error}
                            label={i18n.t("settings.servers.esplora_label")}
                            caption={i18n.t("settings.servers.esplora_caption")}
                        />
                    )}
                </Field>
                <Field
                    name="rgs"
                    validate={[url(i18n.t("settings.servers.error_rgs"))]}
                >
                    {(field, props) => (
                        <TextField
                            {...props}
                            value={field.value}
                            error={field.error}
                            label={i18n.t("settings.servers.rgs_label")}
                            caption={i18n.t("settings.servers.rgs_caption")}
                        />
                    )}
                </Field>
                <Field
                    name="lsp"
                    validate={[url(i18n.t("settings.servers.error_lsp"))]}
                >
                    {(field, props) => (
                        <TextField
                            {...props}
                            value={field.value}
                            error={field.error}
                            label={i18n.t("settings.servers.lsp_label")}
                            caption={i18n.t("settings.servers.lsp_caption")}
                        />
                    )}
                </Field>
                <div />
                <Button
                    type="submit"
                    disabled={!settingsForm.dirty}
                    intent="blue"
                >
                    {i18n.t("settings.servers.save")}
                </Button>
            </Form>
        </Card>
    );
}

export default function Servers() {
    const i18n = useI18n();
    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink
                        href="/settings"
                        title={i18n.t("settings.header")}
                    />
                    <LargeHeader>
                        {i18n.t("settings.servers.title")}
                    </LargeHeader>
                    <SettingsStringsEditor />
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
