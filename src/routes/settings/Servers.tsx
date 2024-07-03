import { createForm, custom, url } from "@modular-forms/solid";
import { createResource, For, Match, Suspense, Switch } from "solid-js";

import {
    BackLink,
    Button,
    Card,
    DefaultMain,
    ExternalLink,
    LargeHeader,
    LoadingShimmer,
    MutinyWalletGuard,
    NavBar,
    NiceP,
    showToast,
    SimpleErrorDisplay,
    TextField,
    TinyText
} from "~/components";
import { useI18n } from "~/i18n/context";
import {
    getSettings,
    MutinyWalletSettingStrings,
    setSettings
} from "~/logic/mutinyWalletSetup";
import { useMegaStore } from "~/state/megaStore";
import { eify } from "~/utils";

const validateNotTorUrl = async (value?: string) => {
    if (!value) {
        return false;
    }

    // if it is one of the default URLs, it's safe
    // need this handling for self-hosting deployments
    if (
        value === import.meta.env.VITE_PROXY ||
        value === import.meta.env.VITE_ESPLORA ||
        value === import.meta.env.VITE_RGS ||
        value === import.meta.env.VITE_LSP ||
        value === import.meta.env.VITE_STORAGE
    ) {
        return true;
    }

    return !value.includes(".onion");
};

function SettingsStringsEditor(props: {
    initialSettings: MutinyWalletSettingStrings;
}) {
    const [_state, _actions, sw] = useMegaStore();
    const i18n = useI18n();
    const [settingsForm, { Form, Field }] =
        createForm<MutinyWalletSettingStrings>({
            initialValues: props.initialSettings
        });

    async function handleSubmit(values: MutinyWalletSettingStrings) {
        try {
            if (values.lsp !== props.initialSettings.lsp) {
                await sw.change_lsp(
                    values.lsp ? values.lsp : undefined,
                    undefined,
                    undefined
                );
            }

            await setSettings(values);
            window.location.reload();
        } catch (e) {
            console.error(e);
            const err = eify(e);
            if (err.message === "Failed to make a request to the LSP.") {
                showToast(
                    new Error(
                        i18n.t("settings.servers.error_lsp_change_failed")
                    )
                );
            } else {
                showToast(eify(e));
            }
        }
    }

    const MAINNET_LSP_OPTIONS = [
        {
            value: "https://0conf.lnolymp.us",
            label: "Olympus by Zeus"
        },
        {
            value: "https://lsp.voltageapi.com",
            label: "Flow 2.0 by Voltage"
        },
        {
            value: "",
            label: "None"
        }
    ];

    const SIGNET_LSP_OPTIONS = [
        {
            value: "https://mutinynet-flow.lnolymp.us",
            label: "Olympus by Zeus"
        },
        {
            value: "https://signet-lsp.mutinywallet.com",
            label: "Flow 2.0 by Voltage"
        },
        {
            value: "",
            label: "None"
        }
    ];

    const LSP_OPTIONS =
        props.initialSettings.network === "signet"
            ? SIGNET_LSP_OPTIONS
            : MAINNET_LSP_OPTIONS;

    return (
        <Card title={i18n.t("settings.servers.title")}>
            <Form onSubmit={handleSubmit} class="flex flex-col gap-4">
                <NiceP>{i18n.t("settings.servers.caption")}</NiceP>
                <ExternalLink href="https://github.com/MutinyWallet/mutiny-web/wiki/Self-hosting">
                    {i18n.t("settings.servers.link")}
                </ExternalLink>
                <div />

                <Field
                    name="lsp"
                    validate={[url(i18n.t("settings.servers.error_lsp"))]}
                >
                    {(field, props) => (
                        <div class="flex flex-col gap-2">
                            <label
                                class="text-sm font-semibold uppercase"
                                for="lsp"
                                id="lsp"
                            >
                                {i18n.t("settings.servers.lsp_label")}
                            </label>
                            <select
                                {...props}
                                value={field.value}
                                class="w-full rounded-lg bg-m-grey-750 py-2 pl-4 pr-12 text-base font-normal text-white"
                            >
                                <For each={LSP_OPTIONS}>
                                    {({ value, label }) => (
                                        <option
                                            selected={field.value === value}
                                            value={value}
                                        >
                                            {label}
                                        </option>
                                    )}
                                </For>
                            </select>
                            <TinyText>
                                {i18n.t("settings.servers.lsp_caption")}
                            </TinyText>
                        </div>
                    )}
                </Field>
                <Field
                    name="proxy"
                    validate={[
                        url(i18n.t("settings.servers.error_proxy")),
                        custom(
                            validateNotTorUrl,
                            i18n.t("settings.servers.error_tor")
                        )
                    ]}
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
                    validate={[
                        url(i18n.t("settings.servers.error_esplora")),
                        custom(
                            validateNotTorUrl,
                            i18n.t("settings.servers.error_tor")
                        )
                    ]}
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
                    validate={[
                        url(i18n.t("settings.servers.error_rgs")),
                        custom(
                            validateNotTorUrl,
                            i18n.t("settings.servers.error_tor")
                        )
                    ]}
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
                    name="storage"
                    validate={[
                        url(i18n.t("settings.servers.error_lsp")),
                        custom(
                            validateNotTorUrl,
                            i18n.t("settings.servers.error_tor")
                        )
                    ]}
                >
                    {(field, props) => (
                        <TextField
                            {...props}
                            value={field.value}
                            error={field.error}
                            label={i18n.t("settings.servers.storage_label")}
                            caption={i18n.t("settings.servers.storage_caption")}
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

function AsyncSettingsEditor() {
    const [_state, _actions, sw] = useMegaStore();

    const [settings] = createResource<MutinyWalletSettingStrings>(async () => {
        const settings = await getSettings();

        // set the lsp to what the node manager is using
        const lsp = await sw.get_configured_lsp();
        settings.lsp = lsp.url;
        settings.lsps_connection_string = lsp.connection_string;
        settings.lsps_token = lsp.token;

        return settings;
    });

    return (
        <Switch>
            <Match when={settings.error}>
                <SimpleErrorDisplay error={settings.error} />
            </Match>
            <Match when={settings.latest}>
                <SettingsStringsEditor initialSettings={settings()!} />
            </Match>
        </Switch>
    );
}

export function Servers() {
    const i18n = useI18n();
    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <BackLink href="/settings" title={i18n.t("settings.header")} />
                <LargeHeader>{i18n.t("settings.servers.title")}</LargeHeader>
                <Suspense fallback={<LoadingShimmer />}>
                    <AsyncSettingsEditor />
                </Suspense>
                <NavBar activeTab="settings" />
            </DefaultMain>
        </MutinyWalletGuard>
    );
}
