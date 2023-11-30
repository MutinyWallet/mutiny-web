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
import { eify } from "~/utils";

type FederationForm = {
    federation_code: string;
};

function fetchFederations() {
    const [state, _actions] = useMegaStore();
    try {
        // Log the attempt to fetch federations
        console.log('Attempting to fetch federations...');
        const result = state.mutiny_wallet?.list_federations();
        console.log('Fetched federations:', result);
        return result ?? [];
    } catch (e) {
        console.error('Error fetching federations:', e);
        return [];
    }
}

function AddFederationForm({ refetch }) {
    const i18n = useI18n();
    const [state, actions] = useMegaStore();
    const [error, setError] = createSignal<Error>();
    const [success, setSuccess] = createSignal("");
    const [federationData, setFederationData] = createSignal({ federation_code: "" });
    const [isDirty, setIsDirty] = createSignal(false);
    const [isValid, setIsValid] = createSignal(false);

    const [feedbackForm, { Form, Field }] = createForm<FederationForm>({
        initialValues: {
            federation_code: ""
        }
    });

    const handleInputChange = (value) => {
        setFederationData({ federation_code: value });
        setIsDirty(true);
        validateForm(value);
    };

    const validateForm = (value) => {
        const isValid = value.trim().length > 0; // Add more validation logic as needed
        setIsValid(isValid);
    };


const handleSubmit: SubmitHandler<FederationForm> = async (f: FederationForm) => {
    try {
        if (!isValid()) {
            setError(new Error("Form is invalid"));
            return;
        }

        const federation_code = federationData().federation_code.trim();
        const newFederation = await state.mutiny_wallet?.new_federation(federation_code);
        console.log('New federation added:', newFederation);
        setSuccess("Federation added successfully!");
        setFederationData({ federation_code: "" }); // Reset the form data

        // Now, refetch federations
        console.log('Refetching federations...');
        await refetch();
    } catch (e) {
        console.error('Error submitting federation:', e);
        setError(eify(e));
    }
};

    return (
        <Form onSubmit={handleSubmit}>
            <VStack>
                <Field name="federation_code">
                    {(field, props) => (
                        <TextField
                            {...props}
                            value={federationData().federation_code}
                            onInput={(e) => handleInputChange(e.currentTarget.value)}
                            error={field.error}
                            label={i18n.t("settings.manage_federations.federation_code_label")}
                            placeholder="fedi1..."
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
                    disabled={!isDirty() || !isValid()}
                    intent="blue"
                    type="submit"
                >
                    {i18n.t("settings.manage_federations.add")}
                </Button>
            </VStack>
        </Form>
    );
}

function ListAndRemoveFederations({ federations, refetch }) {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();
    const [error, setError] = createSignal<Error>();

    const removeFederation = async (federationId) => {
        try {
            await state.mutiny_wallet?.remove_federation(federationId);
            refetch();
        } catch (e) {
            console.error(e);
            setError(eify(e));
        }
    };

    return (
        <VStack>
            <For each={federations() ?? []}>
                {(federationId) => (
                    <FancyCard>
                        <KeyValue key="Federation ID">
                            <MiniStringShower text={federationId} />
                        </KeyValue>
                        <Button intent="red" onClick={() => removeFederation(federationId)}>
                            {i18n.t("settings.manage_federations.remove")}
                        </Button>
                    </FancyCard>
                )}
            </For>
            <Show when={(federations() ?? []).length === 0}>
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
    const [state, actions] = useMegaStore();

    const fetchFederations = async () => {
        try {
            return await state.mutiny_wallet?.list_federations() ?? [];
        } catch (e) {
            console.error(e);
            return [];
        }
    };

    const [federations, { refetch }] = createResource(fetchFederations);

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink href="/settings" title={i18n.t("settings.header")} />
                    <LargeHeader>{i18n.t("settings.manage_federations.title")}</LargeHeader>
		    <AddFederationForm refetch={refetch} federations={federations} />
                    <ListAndRemoveFederations federations={federations} refetch={refetch} />
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
