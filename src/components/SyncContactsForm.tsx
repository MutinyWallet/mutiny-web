import { createForm, required, SubmitHandler } from "@modular-forms/solid";
import { createSignal, Show } from "solid-js";

import { Button, VStack } from "~/components";
import { InfoBox } from "~/components/InfoBox";
import { TextField } from "~/components/layout/TextField";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify } from "~/utils";

type NostrContactsForm = {
    npub: string;
};

export function SyncContactsForm() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();
    const [error, setError] = createSignal<Error>();

    const [feedbackForm, { Form, Field }] = createForm<NostrContactsForm>({
        initialValues: {
            npub: ""
        }
    });

    const handleSubmit: SubmitHandler<NostrContactsForm> = async (
        f: NostrContactsForm
    ) => {
        try {
            const npub = f.npub.trim();
            await state.mutiny_wallet?.sync_nostr_contacts(npub);
        } catch (e) {
            console.error(e);
            setError(eify(e));
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <VStack>
                <Field
                    name="npub"
                    validate={[
                        required(
                            i18n.t("settings.nostr_contacts.npub_required")
                        )
                    ]}
                >
                    {(field, props) => (
                        <TextField
                            {...props}
                            value={field.value}
                            error={field.error}
                            label={i18n.t("settings.nostr_contacts.npub_label")}
                            placeholder="npub..."
                        />
                    )}
                </Field>
                <Show when={error()}>
                    <InfoBox accent="red">{error()?.message}</InfoBox>
                </Show>
                <Button
                    loading={feedbackForm.submitting}
                    disabled={
                        !feedbackForm.dirty ||
                        feedbackForm.submitting ||
                        feedbackForm.invalid
                    }
                    intent="blue"
                    type="submit"
                >
                    {i18n.t("settings.nostr_contacts.sync")}
                </Button>
            </VStack>
        </Form>
    );
}
