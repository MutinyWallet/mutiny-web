import {
    createForm,
    required,
    reset,
    setValue,
    SubmitHandler
} from "@modular-forms/solid";
import { FederationBalance } from "@mutinywallet/mutiny-wasm";
import { A, useSearchParams } from "@solidjs/router";
import { Scan } from "lucide-solid";
import {
    createResource,
    createSignal,
    For,
    Match,
    onMount,
    Show,
    Suspense,
    Switch
} from "solid-js";
import { QRCodeSVG } from "solid-qr-code";

import {
    AmountSats,
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
    TextField,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify, timeAgo } from "~/utils";

type FederationForm = {
    federation_code: string;
};

type HermesForm = {
    name: string;
};

export type MutinyFederationIdentity = {
    federation_id: string;
    federation_name: string;
    welcome_message: string;
    federation_expiry_timestamp: number;
    invite_code: string;
};

type RefetchType = (
    info?: unknown
) =>
    | FederationBalance[]
    | Promise<FederationBalance[] | undefined>
    | null
    | undefined;

function AddFederationForm(props: { refetch?: RefetchType }) {
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
            if (props.refetch) {
                await props.refetch();
            }
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

// todo(paul) put this somewhere else
function HermesForm(props: { onSubmit: (name: string) => void }) {
    const [state, _] = useMegaStore();
    const [error, setError] = createSignal<Error>();
    const [success, setSuccess] = createSignal("");

    const [nameForm, { Form, Field }] = createForm<HermesForm>({
        initialValues: {
            name: ""
        }
    });

    const handleSubmit: SubmitHandler<HermesForm> = async (f: HermesForm) => {
        setSuccess("");
        setError(undefined);
        try {
            const name = f.name;
            console.log("Reserving lnurl name:", name);
            await state.mutiny_wallet?.reserve_lnurl_name(name);
            console.log("lnurl name reserved:", name);
            reset(nameForm);
            // todo this should be on mutiny node side
            localStorage.setItem("lnurl_name", name);
            props.onSubmit(name);
        } catch (e) {
            console.error("Error reserving name:", e);
            setError(eify(e));
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <VStack>
                <Field name="name" validate={[required("must not be empty")]}>
                    {(field, props) => (
                        <TextField
                            {...props}
                            {...field}
                            error={field.error}
                            label={"name"}
                            required
                        />
                    )}
                </Field>
                <Button
                    loading={nameForm.submitting}
                    disabled={nameForm.invalid}
                    intent="blue"
                    type="submit"
                >
                    Submit
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

function FederationListItem(props: {
    fed: MutinyFederationIdentity;
    balance?: bigint;
}) {
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
                <Show when={props.balance !== undefined}>
                    <KeyValue
                        key={i18n.t("activity.transaction_details.balance")}
                    >
                        <AmountSats
                            amountSats={props.balance}
                            denominationSize={"sm"}
                            isFederation
                        />
                    </KeyValue>
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
                <VStack>
                    <div class="w-full rounded-xl bg-white">
                        <QRCodeSVG
                            value={props.fed.invite_code}
                            class="h-full max-h-[256px] w-full p-8"
                        />
                    </div>
                    <Button intent="red" onClick={confirmRemove}>
                        {i18n.t("settings.manage_federations.remove")}
                    </Button>
                </VStack>
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

    const [lnurlName, setLnurlName] = createSignal(
        localStorage.getItem("lnurl_name")
    );

    const [balances, { refetch }] = createResource(async () => {
        try {
            const balances =
                await state.mutiny_wallet?.get_federation_balances();
            return balances?.balances || [];
        } catch (e) {
            console.error(e);
            return [];
        }
    });

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <div class="flex items-center justify-between">
                    <BackLink
                        href="/profile"
                        title={i18n.t("profile.profile")}
                    />
                    <A
                        class="rounded-lg p-2 hover:bg-white/5 active:bg-m-blue md:hidden"
                        href="/scanner"
                    >
                        <Scan />
                    </A>{" "}
                </div>
                {/* <BackLink href="/settings" title={i18n.t("settings.header")} /> */}
                <LargeHeader>
                    {i18n.t("settings.manage_federations.title")}
                </LargeHeader>
                <NiceP>
                    {i18n.t("settings.manage_federations.description")}{" "}
                    <ExternalLink href="https://fedimint.org/">
                        {i18n.t("settings.manage_federations.learn_more")}
                    </ExternalLink>
                </NiceP>
                <Suspense>
                    <Show when={!state.federations?.length}>
                        <AddFederationForm refetch={refetch} />
                    </Show>
                </Suspense>
                <VStack>
                    <Suspense>
                        <Switch>
                            <Match when={balances()}>
                                <For each={state.federations ?? []}>
                                    {(fed) => (
                                        <FederationListItem
                                            fed={fed}
                                            balance={
                                                balances()?.find(
                                                    (b) =>
                                                        b.identity_federation_id ===
                                                        fed.federation_id
                                                )?.balance
                                            }
                                        />
                                    )}
                                </For>
                            </Match>
                            <Match when={true}>
                                <For each={state.federations ?? []}>
                                    {(fed) => <FederationListItem fed={fed} />}
                                </For>
                            </Match>
                        </Switch>
                    </Suspense>
                </VStack>
                <Suspense>
                    <Switch>
                        <Match when={!lnurlName() && state.federations?.length}>
                            <HermesForm onSubmit={setLnurlName} />
                        </Match>
                        <Match when={lnurlName() && state.federations?.length}>
                            <KeyValue key="lnurl_name">
                                <pre>{lnurlName()}</pre>
                            </KeyValue>
                        </Match>
                        <Match when={true}>
                            <pre>Add a federation to reserve an lnurl name</pre>
                        </Match>
                    </Switch>
                </Suspense>
            </DefaultMain>
            <NavBar activeTab="settings" />
        </MutinyWalletGuard>
    );
}
