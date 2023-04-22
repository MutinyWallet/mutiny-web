import { createForm, url } from '@modular-forms/solid';
import { TextField } from '~/components/layout/TextField';
import { NodeManagerSettingStrings, getExistingSettings } from '~/logic/nodeManagerSetup';
import { Button } from '~/components/layout';
import { createSignal } from 'solid-js';
import { deleteDb } from '~/components/DeleteEverything';
import { showToast } from './Toaster';
import eify from '~/utils/eify';
import { ConfirmDialog } from "~/components/Dialog";
import { useMegaStore } from '~/state/megaStore';

export function SettingsStringsEditor() {
    const existingSettings = getExistingSettings();
    const [_settingsForm, { Form, Field }] = createForm<NodeManagerSettingStrings>({ initialValues: existingSettings });
    const [confirmOpen, setConfirmOpen] = createSignal(false);

    const [settingsTemp, setSettingsTemp] = createSignal<NodeManagerSettingStrings>();

    const [_store, actions] = useMegaStore();

    async function handleSubmit(values: NodeManagerSettingStrings) {
        try {
            const existing = getExistingSettings();
            const newSettings = { ...existing, ...values }
            if (existing.network !== values.network) {
                // If the network changes we need to confirm the wipe
                // Save the settings so we can get them later
                setSettingsTemp(newSettings);
                setConfirmOpen(true);
            } else {
                await actions.setupNodeManager(newSettings);
                window.location.reload();
            }
        } catch (e) {
            console.error(e)
            showToast(eify(e))
        }
        console.log(values)
    }

    async function confirmStateReset() {
        try {
            deleteDb("gossip")
            localStorage.clear();
            showToast({ title: "Deleted", description: `Deleted all data` })
            const loadedValues = settingsTemp();

            await actions.setupNodeManager(loadedValues);
            window.location.reload();
        } catch (e) {
            console.error(e)
            showToast(eify(e))
        }

        setConfirmOpen(false);
    }

    return <Form onSubmit={handleSubmit} class="flex flex-col gap-4">
        <ConfirmDialog loading={false} isOpen={confirmOpen()} onConfirm={confirmStateReset} onCancel={() => setConfirmOpen(false)}>
            Are you sure? Changing networks will delete your node's state. This can't be undone!
        </ConfirmDialog>
        <h2 class="text-2xl font-light">Don't trust us! Use your own servers to back Mutiny.</h2>
        <Field name="network">
            {(field, props) => (
                // TODO: make a cool select component
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold uppercase">Network</label>
                    <select {...field} {...props} class="bg-black rounded-xl border border-white px-4 py-2">
                        <option value="bitcoin">Mainnet</option>
                        <option value="testnet">Testnet</option>
                        <option value="regtest">Regtest</option>
                        <option value="signet">Signet</option>
                    </select>
                </div>
            )}
        </Field>
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