import {
    createForm,
    required,
    reset,
    setValue,
    SubmitHandler
} from "@modular-forms/solid";
import { useSearchParams } from "@solidjs/router";
import { createSignal, For, onMount, Show } from "solid-js";

import {
    BackLink,
    Button,
    ConfirmDialog,
    DefaultMain,
    ExternalLink,
    FancyCard,
    InfoBox,
    KeyValue,
    LargeHeader,
    MiniStringShower,
    MutinyWalletGuard,
    NavBar,
    NiceP,
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

export type MutinyFederationIdentity = {
    federation_id: string;
    federation_name: string;
    welcome_message: string;
    federation_expiry_timestamp: number;
};

function AddFederationForm() {
    const i18n = useI18n();
    const [state, actions] = useMegaStore();
    const [error, setError] = createSignal<Error>();
    const [success, setSuccess] = createSignal("");

    const [params, setParams] = useSearchParams();

    onMount(() => {
        if (params.fedimint_invite) {
            setValue(feedbackForm, "federation_code", params.fedimint_invite);

            // Clear the search params
            setParams({ fedimint_invite: undefined });
        }
    });

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
            await actions.refreshFederations();
            reset(feedbackForm);
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
                            placeholder="fed11..."
                            required
                        />
                    )}
                </Field>
                <Button
                    loading={feedbackForm.submitting}
                    disabled={feedbackForm.invalid}
                    intent="blue"
                    type="submit"
                >
                    {i18n.t("settings.manage_federations.add")}
                </Button>
                <Show when={error()}>
                    <InfoBox accent="red">{error()?.message}</InfoBox>
                </Show>
                <Show when={success()}>
                    <InfoBox accent="green">{success()}</InfoBox>
                </Show>
            </VStack>
        </Form>
    );
}

function FederationListItem(props: { fed: MutinyFederationIdentity }) {
    const i18n = useI18n();
    const [state, actions] = useMegaStore();

    async function removeFederation() {
        setConfirmLoading(true);
        try {
            await state.mutiny_wallet?.remove_federation(
                props.fed.federation_id
            );
            await actions.refreshFederations();
        } catch (e) {
            console.error(e);
        }
        setConfirmLoading(false);
    }

    async function confirmRemove() {
        setConfirmOpen(true);
    }

    const [confirmOpen, setConfirmOpen] = createSignal(false);
    const [confirmLoading, setConfirmLoading] = createSignal(false);

    return (
        <>
            <FancyCard>
                <Show when={props.fed.federation_name}>
                    <header class={`font-semibold`}>
                        {props.fed.federation_name}
                    </header>
                </Show>
                <Show when={props.fed.welcome_message}>
                    <p>{props.fed.welcome_message}</p>
                </Show>
                <Show when={props.fed.federation_expiry_timestamp}>
                    <KeyValue
                        key={i18n.t("settings.manage_federations.expires")}
                    >
                        <time>
                            {timeAgo(props.fed.federation_expiry_timestamp)}
                        </time>
                    </KeyValue>
                </Show>
                <KeyValue
                    key={i18n.t("settings.manage_federations.federation_id")}
                >
                    <MiniStringShower text={props.fed.federation_id} />
                </KeyValue>
                <Button intent="red" onClick={confirmRemove}>
                    {i18n.t("settings.manage_federations.remove")}
                </Button>
            </FancyCard>
            <ConfirmDialog
                loading={confirmLoading()}
                open={confirmOpen()}
                onConfirm={removeFederation}
                onCancel={() => setConfirmOpen(false)}
            >
                {i18n.t(
                    "settings.manage_federations.federation_remove_confirm"
                )}
            </ConfirmDialog>
        </>
    );
}

export function ManageFederations() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

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
                    <NiceP>
                        {i18n.t("settings.manage_federations.description")}{" "}
                        <ExternalLink href="https://fedimint.org/">
                            {i18n.t("settings.manage_federations.learn_more")}
                        </ExternalLink>
                    </NiceP>
                    <AddFederationForm />
                    <VStack>
                        <For each={state.federations ?? []}>
                            {(fed) => <FederationListItem fed={fed} />}
                        </For>
                    </VStack>
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
