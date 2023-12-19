import { createForm, required, SubmitHandler } from "@modular-forms/solid";
import { createResource, createSignal, For, Show } from "solid-js";

import {
    BackLink,
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
import { eify, timeAgo } from "~/utils";

type FederationForm = {
    federation_code: string;
};

type MutinyFederationIdentity = {
    federation_id: string;
    federation_name: string;
    welcome_message: string;
    federation_expiry_timestamp: number;
};

function AddFederationForm(props: { refetch: () => void }) {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();
    const [error, setError] = createSignal<Error>();
    const [success, setSuccess] = createSignal("");

    const [feedbackForm, { Form, Field }] = createForm<FederationForm>({
        initialValues: {
            federation_code: ""
        }
    });

    const handleSubmit: SubmitHandler<FederationForm> = async (
        f: FederationForm
    ) => {
        setSuccess("");
        setError(undefined);
        try {
            const federation_code = f.federation_code.trim();
            const newFederation =
                await state.mutiny_wallet?.new_federation(federation_code);
            console.log("New federation added:", newFederation);
            setSuccess(
                i18n.t("settings.manage_federations.federation_added_success")
            );
            await props.refetch();
        } catch (e) {
            console.error("Error submitting federation:", e);
            setError(eify(e));
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <VStack>
                <Field
                    name="federation_code"
                    validate={[
                        required(
                            i18n.t(
                                "settings.manage_federations.federation_code_required"
                            )
                        )
                    ]}
                >
                    {(field, props) => (
                        <TextField
                            {...props}
                            {...field}
                            error={field.error}
                            label={i18n.t(
                                "settings.manage_federations.federation_code_label"
                            )}
                            placeholder="fedi1..."
                            required
                        />
                    )}
                </Field>
                <Show when={error()}>
                    <InfoBox accent="red">{error()?.message}</InfoBox>
                </Show>
                <Show when={success()}>
                    <InfoBox accent="green">{success()}</InfoBox>
                </Show>
                <Button
                    loading={false}
                    disabled={!feedbackForm.touched || feedbackForm.invalid}
                    intent="blue"
                    type="submit"
                >
                    {i18n.t("settings.manage_federations.add")}
                </Button>
            </VStack>
        </Form>
    );
}

function ListAndRemoveFederations(props: {
    federations?: MutinyFederationIdentity[];
    refetch: () => void;
}) {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();
    const [error, setError] = createSignal<Error>();

    const removeFederation = async (federationId: string) => {
        try {
            await state.mutiny_wallet?.remove_federation(federationId);
            props.refetch();
        } catch (e) {
            console.error(e);
            setError(eify(e));
        }
    };

    return (
        <VStack>
            <For each={props.federations ?? []}>
                {(fed) => (
                    <FancyCard>
                        <Show when={fed.federation_name}>
                            <header class={`font-semibold`}>
                                {fed.federation_name}
                            </header>
                        </Show>
                        <Show when={fed.welcome_message}>
                            <p>{fed.welcome_message}</p>
                        </Show>
                        <Show when={fed.federation_expiry_timestamp}>
                            <KeyValue
                                key={i18n.t(
                                    "settings.manage_federations.expires"
                                )}
                            >
                                <time>
                                    {timeAgo(fed.federation_expiry_timestamp)}
                                </time>
                            </KeyValue>
                        </Show>
                        <KeyValue
                            key={i18n.t(
                                "settings.manage_federations.federation_id"
                            )}
                        >
                            <MiniStringShower text={fed.federation_id} />
                        </KeyValue>
                        <Button
                            intent="red"
                            onClick={() => removeFederation(fed.federation_id)}
                        >
                            {i18n.t("settings.manage_federations.remove")}
                        </Button>
                    </FancyCard>
                )}
            </For>
            <Show when={(props.federations ?? []).length === 0}>
                <div>No federations available.</div>
            </Show>
            <Show when={error()}>
                <InfoBox accent="red">{error()?.message}</InfoBox>
            </Show>
        </VStack>
    );
}

export function ManageFederations() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    async function fetchFederations() {
        try {
            const result =
                (await state.mutiny_wallet?.list_federations()) as MutinyFederationIdentity[];
            return result ?? [];
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    const [federations, { refetch }] = createResource(fetchFederations);

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink
                        href="/settings"
                        title={i18n.t("settings.header")}
                    />
                    <LargeHeader>
                        {i18n.t("settings.manage_federations.title")}
                    </LargeHeader>
                    <AddFederationForm refetch={refetch} />
                    <ListAndRemoveFederations
                        federations={federations.latest}
                        refetch={refetch}
                    />
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
