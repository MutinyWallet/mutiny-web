import {
    createForm,
    required,
    reset,
    setValue,
    SubmitHandler
} from "@modular-forms/solid";
import { FederationBalance, TagItem } from "@mutinywallet/mutiny-wasm";
import { A, useSearchParams } from "@solidjs/router";
import { BadgeCheck, Scan } from "lucide-solid";
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
    FancyCard,
    InfoBox,
    KeyValue,
    LabelCircle,
    LargeHeader,
    LoadingSpinner,
    MediumHeader,
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

export type MutinyFederationIdentity = {
    federation_id: string;
    federation_name: string;
    welcome_message: string;
    federation_expiry_timestamp: number;
    invite_code: string;
};

export type Metadata = {
    name: string;
    picture?: string;
    about?: string;
};

export type DiscoveredFederation = {
    id: string;
    invite_codes: string[];
    pubkey: string;
    created_at: number;
    event_id: string;
    metadata: Metadata | undefined;
    recommendations: TagItem[]; // fixme, not the best type to use here
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

    const [loadingFederation, setLoadingFederation] = createSignal("");

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
        const federation_code = f.federation_code.trim();
        await onSelect(federation_code);
    };

    const [federations] = createResource(async () => {
        try {
            const federations: DiscoveredFederation[] =
                await state.mutiny_wallet?.discover_federations();
            return federations;
        } catch (e) {
            console.error(e);
            return [];
        }
    });

    const onSelect = async (inviteCode: string) => {
        setSuccess("");
        setError(undefined);
        setLoadingFederation(inviteCode);
        try {
            const newFederation =
                await state.mutiny_wallet?.new_federation(inviteCode);
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
        setLoadingFederation("");
    };

    return (
        <>
            <MediumHeader>
                {i18n.t("settings.manage_federations.manual")}
            </MediumHeader>
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
                                placeholder="fed11..."
                                required
                            />
                        )}
                    </Field>
                    <Button
                        loading={feedbackForm.submitting}
                        disabled={feedbackForm.invalid || !feedbackForm.dirty}
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
            <MediumHeader>
                {i18n.t("settings.manage_federations.discover")}
            </MediumHeader>
            <Suspense>
                <Switch>
                    <Match when={federations.loading}>
                        <div class="flex flex-col items-center justify-center">
                            <LoadingSpinner wide />
                        </div>
                    </Match>
                    <Match when={federations.latest}>
                        <For each={federations()}>
                            {(fed) => (
                                <FancyCard>
                                    <VStack>
                                        <div class="flex items-center gap-2 md:gap-4">
                                            <LabelCircle
                                                name={fed.metadata?.name}
                                                image_url={
                                                    fed.metadata?.picture
                                                }
                                                contact={false}
                                                label={false}
                                            />
                                            <div>
                                                <header class={`font-semibold`}>
                                                    {fed.metadata?.name}
                                                </header>
                                                <Show
                                                    when={fed.metadata?.about}
                                                >
                                                    <p>{fed.metadata?.about}</p>
                                                </Show>
                                            </div>
                                        </div>
                                        <KeyValue
                                            key={i18n.t(
                                                "settings.manage_federations.federation_id"
                                            )}
                                        >
                                            <MiniStringShower text={fed.id} />
                                        </KeyValue>
                                        <Show when={fed.created_at}>
                                            <KeyValue
                                                key={i18n.t(
                                                    "settings.manage_federations.created_at"
                                                )}
                                            >
                                                <time>
                                                    {timeAgo(fed.created_at)}
                                                </time>
                                            </KeyValue>
                                        </Show>
                                        <Show
                                            when={
                                                fed.recommendations.length > 0
                                            }
                                        >
                                            <KeyValue
                                                key={i18n.t(
                                                    "settings.manage_federations.recommended_by"
                                                )}
                                            >
                                                <div class="flex items-center gap-2 overflow-scroll md:gap-4">
                                                    <For
                                                        each={
                                                            fed.recommendations
                                                        }
                                                    >
                                                        {(contact) => (
                                                            <LabelCircle
                                                                name={
                                                                    contact.name
                                                                }
                                                                image_url={
                                                                    contact.image_url
                                                                }
                                                                contact={true}
                                                                label={false}
                                                            />
                                                        )}
                                                    </For>
                                                </div>
                                            </KeyValue>
                                        </Show>
                                        {/* FIXME: do something smarter than just taking first code */}
                                        <Button
                                            intent="blue"
                                            onClick={() =>
                                                onSelect(fed.invite_codes[0])
                                            }
                                            loading={fed.invite_codes.includes(
                                                loadingFederation()
                                            )}
                                        >
                                            {i18n.t(
                                                "settings.manage_federations.add"
                                            )}
                                        </Button>
                                    </VStack>
                                </FancyCard>
                            )}
                        </For>
                    </Match>
                </Switch>
            </Suspense>
        </>
    );
}

function RecommendButton(props: { fed: MutinyFederationIdentity }) {
    const [state] = useMegaStore();
    const [recommendLoading, setRecommendLoading] = createSignal(false);
    // This is just some local state that makes it feel like they've recommended it
    // even if they aren't a "real person"
    const [recommended, setRecommended] = createSignal(false);

    const [recommendedByMe, { refetch }] = createResource(async () => {
        try {
            const hasRecommended =
                await state.mutiny_wallet?.has_recommended_federation(
                    props.fed.federation_id
                );
            return hasRecommended;
        } catch (e) {
            console.error(e);
            return false;
        }
    });

    async function recommendFederation() {
        setRecommendLoading(true);
        try {
            const event_id = await state.mutiny_wallet?.recommend_federation(
                props.fed.invite_code
            );
            console.log("Recommended federation: ", event_id);
            setRecommended(true);
            refetch();
        } catch (e) {
            console.error("Error recommending federation: ", e);
        }
        setRecommendLoading(false);
    }

    return (
        <Switch>
            <Match when={recommendedByMe() || recommended()}>
                <p class="flex items-center gap-2">
                    <BadgeCheck />
                    Recommended by you
                </p>
            </Match>
            <Match when={true}>
                <Button
                    intent="blue"
                    onClick={recommendFederation}
                    loading={recommendLoading()}
                >
                    Recommend
                </Button>
            </Match>
        </Switch>
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
                <VStack>
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
                        key={i18n.t(
                            "settings.manage_federations.federation_id"
                        )}
                    >
                        <MiniStringShower text={props.fed.federation_id} />
                    </KeyValue>
                    <Suspense>
                        <RecommendButton fed={props.fed} />
                    </Suspense>
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
            </DefaultMain>
            <NavBar activeTab="settings" />
        </MutinyWalletGuard>
    );
}
