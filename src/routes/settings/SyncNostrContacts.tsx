import { createForm, required, SubmitHandler } from "@modular-forms/solid";
import { createSignal, Match, Show, Switch } from "solid-js";

import {
    BackPop,
    Button,
    DefaultMain,
    FancyCard,
    InfoBox,
    KeyValue,
    LargeHeader,
    MiniStringShower,
    MutinyWalletGuard,
    NavBar,
    SafeArea,
    TextField,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify } from "~/utils";

type NostrContactsForm = {
    npub: string;
};

function SyncContactsForm() {
    const i18n = useI18n();
    const [state, actions] = useMegaStore();
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
            actions.saveNpub(npub);
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

export function SyncNostrContacts() {
    const i18n = useI18n();
    const [state, actions] = useMegaStore();
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<Error>();

    function clearNpub() {
        actions.saveNpub("");
    }

    async function resync() {
        setError(undefined);
        setLoading(true);
        try {
            await state.mutiny_wallet?.sync_nostr_contacts(state.npub!);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackPop />
                    <LargeHeader>
                        {i18n.t("settings.nostr_contacts.title")}
                    </LargeHeader>
                    <Switch>
                        <Match when={state.npub}>
                            <VStack>
                                <Show when={error()}>
                                    <InfoBox accent="red">
                                        {error()?.message}
                                    </InfoBox>
                                </Show>
                                <FancyCard>
                                    <VStack>
                                        <KeyValue key="Npub">
                                            <MiniStringShower
                                                text={state.npub || ""}
                                            />
                                        </KeyValue>
                                        <Button
                                            intent="blue"
                                            onClick={resync}
                                            loading={loading()}
                                        >
                                            {i18n.t(
                                                "settings.nostr_contacts.resync"
                                            )}
                                        </Button>
                                        <Button
                                            intent="red"
                                            onClick={clearNpub}
                                        >
                                            {i18n.t(
                                                "settings.nostr_contacts.remove"
                                            )}
                                        </Button>
                                    </VStack>
                                </FancyCard>
                            </VStack>
                        </Match>
                        <Match when={!state.npub}>
                            <SyncContactsForm />
                        </Match>
                    </Switch>
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
