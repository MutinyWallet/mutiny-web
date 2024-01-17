import { Capacitor } from "@capacitor/core";
import { createForm, required, SubmitHandler } from "@modular-forms/solid";
import { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { createResource, createSignal, Match, Show, Switch } from "solid-js";

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

const PRIMAL_API = import.meta.env.VITE_PRIMAL;

function SyncContactsForm() {
    const i18n = useI18n();
    const [state, actions] = useMegaStore();
    const [error, setError] = createSignal<Error>();

    const allowNsec = Capacitor.isNativePlatform();

    const [feedbackForm, { Form, Field }] = createForm<NostrContactsForm>({
        initialValues: {
            npub: ""
        }
    });

    const handleSubmit: SubmitHandler<NostrContactsForm> = async (
        f: NostrContactsForm
    ) => {
        try {
            const string = f.npub.trim();
            let npub = string;

            // if it is an nsec, save it into secure storage
            if (string.startsWith("nsec")) {
                if (!allowNsec) {
                    throw new Error(
                        "nsec not allowed in web version, please install the app"
                    );
                }

                // set in storage
                SecureStoragePlugin.set({ key: "nsec", value: string }).then(
                    (success) => console.log(success)
                );

                // set npub and continue
                npub = await MutinyWallet.nsec_to_npub(string);
            }

            if (!PRIMAL_API) throw new Error("PRIMAL_API not set");
            await state.mutiny_wallet?.sync_nostr_contacts(PRIMAL_API, npub);
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
                            placeholder={allowNsec ? "npub/nsec..." : "npub..."}
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
    const [state, actions] = useMegaStore();
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<Error>();

    async function clearNpub() {
        actions.saveNpub("");
        if (Capacitor.isNativePlatform()) {
            await SecureStoragePlugin.remove({ key: "nsec" });
        }
    }

    const [hasNsec] = createResource(async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                await SecureStoragePlugin.get({ key: "nsec" });
                return true;
            } catch (_e) {
                return false;
            }
        } else {
            return false;
        }
    });

    async function resync() {
        setError(undefined);
        setLoading(true);
        try {
            if (!PRIMAL_API) throw new Error("PRIMAL_API not set");
            await state.mutiny_wallet?.sync_nostr_contacts(
                PRIMAL_API,
                // We can only see the resync button if there's an npub set
                state.npub!
            );
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
                    <LargeHeader>Sync Nostr Contacts</LargeHeader>
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
                                            Resync
                                        </Button>
                                        <Button
                                            intent="red"
                                            onClick={clearNpub}
                                        >
                                            Remove
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
