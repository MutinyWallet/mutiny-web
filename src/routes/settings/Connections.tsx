import { NwcProfile } from "@mutinywallet/mutiny-wasm";
import { A, useSearchParams } from "@solidjs/router";
import {
    createResource,
    createSignal,
    ErrorBoundary,
    For,
    Show
} from "solid-js";
import { QRCodeSVG } from "solid-qr-code";

import scan from "~/assets/icons/scan.svg";
import {
    AmountSats,
    AmountSmall,
    BackLink,
    Button,
    Collapser,
    ConfirmDialog,
    DefaultMain,
    InfoBox,
    KeyValue,
    LargeHeader,
    MutinyWalletGuard,
    NavBar,
    NiceP,
    SafeArea,
    SettingsCard,
    ShareCard,
    SimpleDialog,
    SmallHeader,
    TinyText,
    VStack
} from "~/components";
import { NWCEditor } from "~/components/NWCEditor";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { createDeepSignal, openLinkProgrammatically } from "~/utils";

function Spending(props: { spent: number; remaining: number }) {
    const i18n = useI18n();
    return (
        <VStack smallgap>
            <div class="flex justify-between">
                <SmallHeader>
                    {i18n.t("settings.connections.spent")}
                </SmallHeader>
                <SmallHeader>
                    {i18n.t("settings.connections.remaining")}
                </SmallHeader>
            </div>
            <div class="flex w-full gap-1">
                <div
                    class="min-w-fit rounded-l-xl bg-m-green p-2"
                    style={{
                        "flex-grow": props.spent || 1
                    }}
                >
                    <AmountSmall amountSats={props.spent} />
                </div>

                <div
                    class="min-w-fit rounded-r-xl bg-m-blue p-2"
                    style={{
                        "flex-grow": props.remaining || 1
                    }}
                >
                    <AmountSmall amountSats={props.remaining} />
                </div>
            </div>
        </VStack>
    );
}

function NwcDetails(props: {
    profile: NwcProfile;
    refetch: () => void;
    onEdit?: () => void;
}) {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const [confirmOpen, setConfirmOpen] = createSignal(false);

    function confirmDelete() {
        setConfirmOpen(true);
    }

    async function deleteProfile() {
        try {
            await state.mutiny_wallet?.delete_nwc_profile(props.profile.index);
            setConfirmOpen(false);
            props.refetch();
        } catch (e) {
            console.error(e);
        }
    }

    async function openInNostrClient() {
        const uri = props.profile.nwc_uri;
        await openLinkProgrammatically(uri, {
            title: i18n.t("settings.connections.nostr_client_not_found"),
            description: i18n.t(
                "settings.connections.client_not_found_description"
            )
        });
    }

    return (
        <VStack>
            <Show when={props.profile.index >= 1000 && props.profile.nwc_uri}>
                <div class="w-full rounded-xl bg-white">
                    <QRCodeSVG
                        value={props.profile.nwc_uri!}
                        class="h-full max-h-[320px] w-full p-8"
                    />
                </div>
                <ShareCard text={props.profile.nwc_uri || ""} />
            </Show>

            <Show when={!props.profile.require_approval}>
                <Show when={props.profile.nwc_uri}>
                    <TinyText>
                        {i18n.t("settings.connections.careful")}
                    </TinyText>
                </Show>
                <Spending
                    spent={Number(
                        Number(props.profile.budget_amount || 0) -
                            Number(props.profile.budget_remaining || 0)
                    )}
                    remaining={Number(props.profile.budget_remaining || 0)}
                />
                <KeyValue key={i18n.t("settings.connections.budget")}>
                    <AmountSats amountSats={props.profile.budget_amount} />
                </KeyValue>
                {/* No interval for gifts */}
                <Show when={props.profile.budget_period}>
                    <KeyValue key={i18n.t("settings.connections.resets_every")}>
                        {props.profile.budget_period}
                    </KeyValue>
                </Show>
                <Show when={props.profile.index === 0}>
                    <KeyValue
                        key={i18n.t("settings.connections.resubscribe_date")}
                    >
                        {new Date(
                            state.subscription_timestamp! * 1000
                        ).toLocaleDateString()}
                    </KeyValue>
                </Show>
            </Show>

            <Button layout="small" intent="green" onClick={props.onEdit}>
                {i18n.t("settings.connections.edit_budget")}
            </Button>

            <Show
                when={
                    props.profile.tag !== "Gift" &&
                    props.profile.tag !== "Subscription" &&
                    props.profile.nwc_uri
                }
            >
                <Button
                    layout="small"
                    intent="blue"
                    onClick={openInNostrClient}
                >
                    {i18n.t("settings.connections.open_in_nostr_client")}
                </Button>
            </Show>

            <Button layout="small" onClick={confirmDelete}>
                {i18n.t("settings.connections.delete_connection")}
            </Button>
            <ConfirmDialog
                loading={false}
                open={confirmOpen()}
                onConfirm={deleteProfile}
                onCancel={() => setConfirmOpen(false)}
            >
                {i18n.t("settings.connections.confirm_delete")}
            </ConfirmDialog>
        </VStack>
    );
}

function Nwc() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    async function fetchNwcProfiles() {
        try {
            const profiles = await state.mutiny_wallet?.get_nwc_profiles();
            if (!profiles) return [];

            return profiles;
        } catch (e) {
            console.error(e);
        }
    }

    const [nwcProfiles, { refetch }] = createResource(fetchNwcProfiles, {
        storage: createDeepSignal
    });

    const [searchParams, setSearchParams] = useSearchParams();
    const [callbackDialogOpen, setCallbackDialogOpen] = createSignal(false);
    const [callbackUri, setCallbackUri] = createSignal<string>();

    // Profile creation / editing
    const [dialogOpen, setDialogOpen] = createSignal(
        !!searchParams.queryName || !!searchParams.nwa
    );

    function handleToggleOpen(open: boolean) {
        setDialogOpen(open);
        // If they close the dialog clear the search params
        setSearchParams({ nwa: undefined, name: undefined });
    }

    const [profileToOpen, setProfileToOpen] = createSignal<number>();

    function editProfile(profile: NwcProfile) {
        setProfileToOpen(profile.index);
        setDialogOpen(true);
    }

    function createProfile() {
        setProfileToOpen(undefined);
        setDialogOpen(true);
    }

    const [newConnection, setNewConnection] = createSignal<number>();

    async function handleSave(
        indexToOpen?: number,
        nwcUriForCallback?: string
    ) {
        setDialogOpen(false);
        refetch();

        if (indexToOpen) {
            setNewConnection(indexToOpen);
        }

        const callbackUriScheme = searchParams.callbackUri;
        if (callbackUriScheme && nwcUriForCallback) {
            const fullURI = nwcUriForCallback.replace(
                "nostr+walletconnect://",
                `${callbackUriScheme}://`
            );
            setCallbackUri(fullURI);
            setCallbackDialogOpen(true);
        }

        setSearchParams({ nwa: undefined, name: undefined });
    }

    async function openCallbackUri() {
        await openLinkProgrammatically(callbackUri());
        setSearchParams({ callbackUri: "" });
        setCallbackDialogOpen(false);
    }

    return (
        <VStack biggap>
            <Button intent="blue" onClick={createProfile}>
                {i18n.t("settings.connections.add_connection")}
            </Button>
            <Show when={nwcProfiles.latest && nwcProfiles.latest?.length > 0}>
                <SettingsCard
                    title={i18n.t("settings.connections.manage_connections")}
                >
                    <For each={nwcProfiles()?.filter((p) => p.tag !== "Gift")}>
                        {(profile) => (
                            <Collapser
                                title={profile.name}
                                activityLight={"on"}
                                defaultOpen={profile.index === newConnection()}
                            >
                                <NwcDetails
                                    onEdit={() => editProfile(profile)}
                                    profile={profile}
                                    refetch={refetch}
                                />
                            </Collapser>
                        )}
                    </For>
                </SettingsCard>
            </Show>
            <SimpleDialog
                open={dialogOpen()}
                setOpen={handleToggleOpen}
                title={
                    profileToOpen()
                        ? i18n.t("settings.connections.edit_connection")
                        : i18n.t("settings.connections.add_connection")
                }
            >
                <ErrorBoundary
                    fallback={(e) => (
                        <InfoBox accent="red">{e.message}</InfoBox>
                    )}
                >
                    <NWCEditor
                        initialNWA={searchParams.nwa}
                        initialProfileIndex={profileToOpen()}
                        onSave={handleSave}
                    />
                </ErrorBoundary>
            </SimpleDialog>
            <SimpleDialog
                open={callbackDialogOpen()}
                setOpen={setCallbackDialogOpen}
                title={i18n.t("settings.connections.open_app")}
            >
                <Button onClick={openCallbackUri}>
                    {i18n.t("settings.connections.open_app")}
                </Button>
            </SimpleDialog>
        </VStack>
    );
}

export function Connections() {
    const i18n = useI18n();
    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <div class="flex items-center justify-between">
                        <BackLink
                            href="/settings"
                            title={i18n.t("settings.header")}
                        />
                        <A
                            class="rounded-lg p-2 hover:bg-white/5 active:bg-m-blue md:hidden"
                            href="/scanner"
                        >
                            <img src={scan} alt="Scan" class="h-6 w-6" />
                        </A>{" "}
                    </div>
                    <LargeHeader>
                        {i18n.t("settings.connections.title")}
                    </LargeHeader>
                    <NiceP>{i18n.t("settings.connections.authorize")}</NiceP>
                    <Nwc />
                    <div class="h-full" />
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
