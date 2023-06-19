import { createForm, url } from "@modular-forms/solid";
import { TextField } from "~/components/layout/TextField";
import {
    MutinyWalletSettingStrings,
    getExistingSettings,
    setAndGetMutinySettings
} from "~/logic/mutinyWalletSetup";
import { Button, Card, NiceP } from "~/components/layout";
import { showToast } from "./Toaster";
import eify from "~/utils/eify";
import { ExternalLink } from "./layout/ExternalLink";

export function SettingsStringsEditor() {
    const existingSettings = getExistingSettings();
    const [settingsForm, { Form, Field }] =
        createForm<MutinyWalletSettingStrings>({
            initialValues: existingSettings
        });

    async function handleSubmit(values: MutinyWalletSettingStrings) {
        try {
            const newSettings = { ...existingSettings, ...values };
            await setAndGetMutinySettings(newSettings);
            window.location.reload();
        } catch (e) {
            console.error(e);
            showToast(eify(e));
        }
        console.log(values);
    }

    return (
        <Card title="Servers">
            <Form onSubmit={handleSubmit} class="flex flex-col gap-4">
                <NiceP>
                    Don't trust us! Use your own servers to back Mutiny.
                </NiceP>
                <ExternalLink href="https://github.com/MutinyWallet/mutiny-web/wiki/Self-hosting">
                    Learn more about self-hosting
                </ExternalLink>
                <div />
                <Field
                    name="proxy"
                    validate={[url("Should be a url starting with wss://")]}
                >
                    {(field, props) => (
                        <TextField
                            {...props}
                            value={field.value}
                            error={field.error}
                            label="Websockets Proxy"
                            caption="How your lightning node communicates with the rest of the network."
                        />
                    )}
                </Field>
                <Field
                    name="esplora"
                    validate={[url("That doesn't look like a URL")]}
                >
                    {(field, props) => (
                        <TextField
                            {...props}
                            value={field.value}
                            error={field.error}
                            label="Esplora"
                            caption="Block data for on-chain information."
                        />
                    )}
                </Field>
                <Field
                    name="rgs"
                    validate={[url("That doesn't look like a URL")]}
                >
                    {(field, props) => (
                        <TextField
                            {...props}
                            value={field.value}
                            error={field.error}
                            label="RGS"
                            caption="Rapid Gossip Sync. Network data about the lightning network used for routing."
                        />
                    )}
                </Field>
                <Field
                    name="lsp"
                    validate={[url("That doesn't look like a URL")]}
                >
                    {(field, props) => (
                        <TextField
                            {...props}
                            value={field.value}
                            error={field.error}
                            label="LSP"
                            caption="Lightning Service Provider. Automatically opens channels to you for inbound liquidity. Also wraps invoices for privacy."
                        />
                    )}
                </Field>
                <div />
                <Button
                    type="submit"
                    disabled={!settingsForm.dirty}
                    intent="blue"
                >
                    Save
                </Button>
            </Form>
        </Card>
    );
}
