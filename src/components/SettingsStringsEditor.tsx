import { createForm, url } from '@modular-forms/solid';
import { TextField } from '~/components/layout/TextField';
import { MutinyWalletSettingStrings, getExistingSettings } from '~/logic/mutinyWalletSetup';
import { Button, SmallHeader } from '~/components/layout';
import { showToast } from './Toaster';
import eify from '~/utils/eify';
import { useMegaStore } from '~/state/megaStore';

export function SettingsStringsEditor() {
    const existingSettings = getExistingSettings();
    const [_settingsForm, { Form, Field }] = createForm<MutinyWalletSettingStrings>({ initialValues: existingSettings });
    const [_store, actions] = useMegaStore();

    async function handleSubmit(values: MutinyWalletSettingStrings) {
        try {
            const existing = getExistingSettings();
            const newSettings = { ...existing, ...values }
            await actions.setupMutinyWallet(newSettings);
            window.location.reload();
        } catch (e) {
            console.error(e)
            showToast(eify(e))
        }
        console.log(values)
    }

    return <Form onSubmit={handleSubmit} class="flex flex-col gap-4">
        <h2 class="text-2xl font-light">Don't trust us! Use your own servers to back Mutiny.</h2>
        <div class="flex flex-col gap-2">
            <SmallHeader>Network</SmallHeader>
            <pre>
                {existingSettings.network}
            </pre>
        </div>

        <Field name="proxy" validate={[url("Should be a url starting with wss://")]}>
            {(field, props) => (
                <TextField  {...props} value={field.value} error={field.error} label="Websockets Proxy" />
            )}
        </Field>
        <Field name="esplora" validate={[url("That doesn't look like a URL")]}>
            {(field, props) => (
                <TextField  {...props} value={field.value} error={field.error} label="Esplora" />
            )}
        </Field>
        <Field name="rgs" validate={[url("That doesn't look like a URL")]}>
            {(field, props) => (
                <TextField  {...props} value={field.value} error={field.error} label="RGS" />
            )}
        </Field>
        <Field name="lsp" validate={[url("That doesn't look like a URL")]}>
            {(field, props) => (
                <TextField  {...props} value={field.value} error={field.error} label="LSP" />
            )}
        </Field>
        <Button type="submit">Save</Button>
    </Form>

}