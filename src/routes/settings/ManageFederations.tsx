import { Progress } from "@kobalte/core";
import {
    createForm,
    required,
    reset,
    setValue,
    SubmitHandler
} from "@modular-forms/solid";
import { FederationBalance, TagItem } from "@mutinywallet/mutiny-wasm";
import { A, useNavigate, useSearchParams } from "@solidjs/router";
import {
    ArrowLeftRight,
    BadgeCheck,
    LogOut,
    RefreshCw,
    Scan,
    Trash
} from "lucide-solid";
import {
    createEffect,
    createResource,
    createSignal,
    For,
    Match,
    onCleanup,
    onMount,
    Show,
    Suspense,
    Switch
} from "solid-js";

import {
    AmountSats,
    BackLink,
    Button,
    ConfirmDialog,
    DefaultMain,
    ExternalLink,
    FancyCard,
    FederationInviteShower,
    FederationPopup,
    InfoBox,
    KeyValue,
    LargeHeader,
    MediumHeader,
    MiniStringShower,
    MutinyWalletGuard,
    NavBar,
    NiceP,
    showToast,
    SimpleDialog,
    SubtleButton,
    TextField,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify, timeAgo, timeout } from "~/utils";

type FederationForm = {
    federation_code: string;
};

export type MutinyFederationIdentity = {
    federation_id: string;
    federation_name: string;
    welcome_message: string;
    federation_expiry_timestamp: number;
    invite_code: string;
    meta_external_url?: string;
    popup_end_timestamp?: number;
    popup_countdown_message?: string;
};

export type Metadata = {
    name: string;
    picture?: string;
    about?: string;
};

export type ResyncProgress = {
    total: number;
    complete: number;
    done: boolean;
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

export function AddFederationForm(props: {
    refetch?: RefetchType;
    setup?: boolean;
    browseOnly?: boolean;
}) {
    const i18n = useI18n();
    const [state, actions, sw] = useMegaStore();
    const navigate = useNavigate();
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
        const federation_code = f.federation_code.trim();
        await onSelect([federation_code]);
    };

    const onSelect = async (inviteCodes: string[]) => {
        setSuccess("");
        setError(undefined);
        try {
            for (const inviteCode of inviteCodes) {
                try {
                    console.log("Adding federation:", inviteCode);
                    const newFederation = await sw.new_federation(inviteCode);
                    console.log("New federation added:", newFederation);
                    break;
                } catch (e) {
                    const error = eify(e);
                    console.log("Error adding federation:", error.message);
                    // if we can't connect to the guardian, try to others,
                    // otherwise throw the error
                    if (
                        error.message ===
                            "Failed to connect to a federation." ||
                        error.message === "Invalid Arguments were given"
                    ) {
                        console.error(
                            "Failed to connect to guardian, trying another one"
                        );
                    } else {
                        throw e;
                    }
                }
            }
            setSuccess(
                i18n.t("settings.manage_federations.federation_added_success")
            );
            await actions.refreshFederations();
            if (props.refetch) {
                await props.refetch();
            }
            reset(feedbackForm);
            if (props.setup) {
                navigate("/");
            }
        } catch (e) {
            console.error("Error submitting federation:", e);
            setError(eify(e));
        }
    };

    return (
        <div class="flex w-full flex-col gap-4">
            <Show when={state.expiration_warning}>
                <FederationPopup />
            </Show>
            <Show when={!props.setup && !props.browseOnly}>
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
                            disabled={
                                feedbackForm.invalid || !feedbackForm.dirty
                            }
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
            </Show>
        </div>
    );
}

function RecommendButton(props: { fed: MutinyFederationIdentity }) {
    const [_state, _actions, sw] = useMegaStore();
    const i18n = useI18n();
    const [recommendLoading, setRecommendLoading] = createSignal(false);
    // This is just some local state that makes it feel like they've recommended it
    // even if they aren't a "real person"
    const [recommended, setRecommended] = createSignal(false);

    const [recommendedByMe, { refetch }] = createResource(async () => {
        try {
            const hasRecommended = await sw.has_recommended_federation(
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
            const event_id = await sw.recommend_federation(
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

    async function deleteRecommendation() {
        setRecommendLoading(true);
        try {
            await sw.delete_federation_recommendation(props.fed.federation_id);
            setRecommended(false);
            refetch();
        } catch (e) {
            console.error("Error deleting federation recommendation: ", e);
        }
        setRecommendLoading(false);
    }

    return (
        <Switch>
            <Match when={recommendedByMe() || recommended()}>
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <BadgeCheck class="h-4 w-4" />
                        {i18n.t(
                            "settings.manage_federations.recommended_by_you"
                        )}
                    </div>
                    <SubtleButton
                        onClick={deleteRecommendation}
                        loading={recommendLoading()}
                    >
                        <Trash class="h-4 w-4" />
                    </SubtleButton>
                </div>
            </Match>
            <Match when={true}>
                <SubtleButton
                    onClick={recommendFederation}
                    loading={recommendLoading()}
                >
                    <BadgeCheck class="h-4 w-4" />
                    {i18n.t("settings.manage_federations.recommend")}
                </SubtleButton>
            </Match>
        </Switch>
    );
}

function ResyncLoadingBar(props: { value: number; max: number }) {
    return (
        <Progress.Root
            value={props.value}
            minValue={0}
            maxValue={props.max}
            getValueLabel={({ value, max }) => {
                const percent = Math.round((value / max) * 100);
                return `${percent}% - ${value.toLocaleString()} / ${max.toLocaleString()}`;
            }}
            class="flex w-full flex-col gap-2"
        >
            <Progress.ValueLabel class="text-sm text-m-grey-400" />
            <Progress.Track class="h-6  rounded bg-white/10">
                <Progress.Fill class="h-full w-[var(--kb-progress-fill-width)] rounded bg-m-blue transition-[width]" />
            </Progress.Track>
        </Progress.Root>
    );
}

function FederationListItem(props: {
    fed: MutinyFederationIdentity;
    balance?: bigint;
}) {
    const i18n = useI18n();
    const [state, actions, sw] = useMegaStore();
    const navigate = useNavigate();

    async function removeFederation() {
        setConfirmLoading(true);
        try {
            await sw.remove_federation(props.fed.federation_id);
            await actions.refreshFederations();
        } catch (e) {
            console.error(e);
        }
        setConfirmLoading(false);
    }

    // Warn when leaving the page if there's a resync in progress
    createEffect(() => {
        if (resyncLoading()) {
            window.onbeforeunload = function () {
                return true;
            };
        } else {
            window.onbeforeunload = null;
        }
    });

    const [shouldPollProgress, setShouldPollProgress] = createSignal(false);

    async function resyncFederation() {
        setResyncLoading(true);
        try {
            await sw.resync_federation(props.fed.federation_id);

            console.log("RESYNC STARTED");

            // This loop is so we can try enough times until the resync actually starts
            for (let i = 0; i < 60; i++) {
                await timeout(1000);
                const progress = await sw.get_federation_resync_progress(
                    props.fed.federation_id
                );

                console.log("progress", progress);
                if (progress?.total !== 0) {
                    setResyncProgress(progress);
                    setResyncOpen(false);
                    setShouldPollProgress(true);
                    break;
                }
            }
        } catch (e) {
            console.error(e);
            setResyncLoading(false);
        }
    }

    function refetch() {
        sw.get_federation_resync_progress(props.fed.federation_id).then(
            (progress) => {
                // if the progress is undefined, it also means we're done
                if (progress === undefined) {
                    setResyncProgress({
                        total: 100,
                        complete: 100,
                        done: true
                    });
                    setShouldPollProgress(false);
                    setResyncLoading(false);
                    return;
                } else if (progress?.done) {
                    setShouldPollProgress(false);
                    setResyncLoading(false);
                }

                setResyncProgress(progress);
            }
        );
    }

    createEffect(() => {
        let interval = undefined;

        if (shouldPollProgress()) {
            interval = setInterval(() => {
                refetch();
            }, 1000); // Poll every second
        }

        if (!shouldPollProgress()) {
            clearInterval(interval);
        }

        onCleanup(() => {
            clearInterval(interval);
        });
    });

    async function confirmRemove() {
        setConfirmOpen(true);
    }

    async function confirmResync() {
        setResyncOpen(true);
    }

    const [transferDialogOpen, setTransferDialogOpen] = createSignal(false);

    async function transferFunds() {
        // If there's only one federation we need to let them know to add another
        if (state.federations?.length && state.federations.length < 2) {
            setTransferDialogOpen(true);
        } else {
            navigate("/transfer?from=" + props.fed.federation_id);
        }
    }

    const [confirmOpen, setConfirmOpen] = createSignal(false);
    const [confirmLoading, setConfirmLoading] = createSignal(false);

    const [resyncOpen, setResyncOpen] = createSignal(false);
    const [resyncLoading, setResyncLoading] = createSignal(false);

    const [resyncProgress, setResyncProgress] = createSignal<
        ResyncProgress | undefined
    >(undefined);

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
                    <SimpleDialog
                        title={i18n.t(
                            "settings.manage_federations.transfer_funds"
                        )}
                        open={transferDialogOpen()}
                        setOpen={setTransferDialogOpen}
                    >
                        <NiceP>
                            {i18n.t(
                                "settings.manage_federations.transfer_funds_message"
                            )}
                        </NiceP>
                    </SimpleDialog>
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
                    <KeyValue key={"Invite code"}>
                        <FederationInviteShower
                            name={props.fed.federation_name}
                            inviteCode={props.fed.invite_code}
                        />
                    </KeyValue>
                    <SubtleButton onClick={transferFunds}>
                        <ArrowLeftRight class="h-4 w-4" />
                        {i18n.t("settings.manage_federations.transfer_funds")}
                    </SubtleButton>
                    <Suspense>
                        <RecommendButton fed={props.fed} />
                    </Suspense>
                    <SubtleButton intent="red" onClick={confirmRemove}>
                        <LogOut class="h-4 w-4" />
                        {i18n.t("settings.manage_federations.remove")}
                    </SubtleButton>
                    <Show when={state.safe_mode}>
                        <SubtleButton intent="red" onClick={confirmResync}>
                            <RefreshCw class="h-4 w-4" />
                            Resync
                        </SubtleButton>
                    </Show>
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
            <ConfirmDialog
                loading={resyncLoading()}
                open={resyncOpen()}
                onConfirm={resyncFederation}
                onCancel={() => setResyncOpen(false)}
            >
                Are you sure you want to resync this federation? This will
                rescan the federation for your ecash, this can take multiple
                hours in some cases. If you stop the rescan it can cause your
                wallet to be bricked. Please be sure you can run the rescan
                before you start it.
            </ConfirmDialog>
            <Show when={resyncProgress()}>
                <SimpleDialog
                    title={"Resyncing..."}
                    open={!resyncProgress()!.done}
                >
                    <Show when={!resyncProgress()!.done}>
                        <NiceP>This could take a couple of hours.</NiceP>
                        <NiceP>
                            DO NOT CLOSE THIS WINDOW UNTIL RESYNC IS DONE.
                        </NiceP>
                        <ResyncLoadingBar
                            value={resyncProgress()!.complete}
                            max={resyncProgress()!.total}
                        />
                    </Show>
                    <Show when={resyncProgress()!.done}>
                        <NiceP>Resync complete!</NiceP>
                        <Button onClick={() => (window.location.href = "/")}>
                            Nice
                        </Button>
                    </Show>
                </SimpleDialog>
            </Show>
        </>
    );
}

export function ManageFederations() {
    const i18n = useI18n();
    const [state, _actions, sw] = useMegaStore();

    const [balances, { refetch }] = createResource(async () => {
        try {
            const balances = await sw.get_federation_balances();
            return balances?.balances || [];
        } catch (e) {
            console.error(e);
            return [];
        }
    });

    const [params, setParams] = useSearchParams();

    onMount(() => {
        if (params.fedimint_invite && state.federations?.length) {
            showToast(
                new Error(i18n.t("settings.manage_federations.already_in_fed"))
            );

            // Clear the search params
            setParams({ fedimint_invite: undefined });
        }
    });

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <div class="flex items-center justify-between">
                    <BackLink
                        href="/profile"
                        title={i18n.t("profile.profile")}
                        showOnDesktop
                    />
                    <Show when={!state.federations?.length}>
                        <A
                            class="rounded-lg p-2 hover:bg-white/5 active:bg-m-blue"
                            href="/scanner"
                        >
                            <Scan />
                        </A>{" "}
                    </Show>
                </div>
                <LargeHeader>
                    {i18n.t("settings.manage_federations.title")}
                </LargeHeader>
                <NiceP>
                    {i18n.t("settings.manage_federations.description")}{" "}
                </NiceP>
                <NiceP>
                    {i18n.t("settings.manage_federations.descriptionpart2")}{" "}
                </NiceP>
                <NiceP>
                    <ExternalLink href="https://fedimint.org/docs/intro">
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
                    <Show when={state.federations?.length}>
                        <AddFederationForm refetch={refetch} />
                    </Show>
                </Suspense>
            </DefaultMain>
            <NavBar activeTab="settings" />
        </MutinyWalletGuard>
    );
}
