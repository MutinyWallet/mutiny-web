import { NwcProfile, type BudgetPeriod } from "@mutinywallet/mutiny-wasm";
import {
    createEffect,
    createResource,
    createSignal,
    For,
    Show
} from "solid-js";
import { QRCodeSVG } from "solid-qr-code";
import { useSearchParams } from "solid-start";

import {
    AmountSats,
    AmountSmall,
    BackLink,
    Button,
    Collapser,
    ConfirmDialog,
    DefaultMain,
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
import { BudgetForm, NWCBudgetEditor } from "~/components/NWCBudgetEditor";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { createDeepSignal, openLinkProgrammatically } from "~/utils";

function mapIntervalToBudgetPeriod(
    interval: "Day" | "Week" | "Month" | "Year"
): BudgetPeriod {
    switch (interval) {
        case "Day":
            return 0;
        case "Week":
            return 1;
        case "Month":
            return 2;
        case "Year":
            return 3;
    }
}

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

    function openInNostrClient() {
        const uri = props.profile.nwc_uri;
        openLinkProgrammatically(uri);
    }

    function openInPrimal() {
        const uri = props.profile.nwc_uri;
        const connectString = uri.replace("nostr+walletconnect", "primal");
        openLinkProgrammatically(connectString);
    }

    return (
        <VStack>
            <Show when={props.profile.index >= 1000}>
                <div class="w-full rounded-xl bg-white">
                    <QRCodeSVG
                        value={props.profile.nwc_uri}
                        class="h-full max-h-[320px] w-full p-8"
                    />
                </div>
                <ShareCard text={props.profile.nwc_uri || ""} />
            </Show>

            <Show when={!props.profile.require_approval}>
                <TinyText>{i18n.t("settings.connections.careful")}</TinyText>
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
                    props.profile.tag !== "Subscription"
                }
            >
                <Button layout="small" onClick={openInNostrClient}>
                    {i18n.t("settings.connections.open_in_nostr_client")}
                </Button>

                <Button layout="small" onClick={openInPrimal}>
                    {i18n.t("settings.connections.open_in_primal")}
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
            const profiles: NwcProfile[] =
                await state.mutiny_wallet?.get_nwc_profiles();

            return profiles;
        } catch (e) {
            console.error(e);
        }
    }

    const [nwcProfiles, { refetch }] = createResource(fetchNwcProfiles, {
        storage: createDeepSignal
    });

    const [searchParams, setSearchParams] = useSearchParams();
    const queryName = searchParams.name;
    const [callbackDialogOpen, setCallbackDialogOpen] = createSignal(false);
    const [callbackUri, setCallbackUri] = createSignal<string>();

    // Profile creation / editing
    const [dialogOpen, setDialogOpen] = createSignal(!!queryName);
    const [profileToOpen, setProfileToOpen] = createSignal<NwcProfile>();

    function editProfile(profile: NwcProfile) {
        setProfileToOpen(profile);
        setDialogOpen(true);
    }

    function createProfile() {
        setProfileToOpen(undefined);
        setDialogOpen(true);
    }

    const [newConnection, setNewConnection] = createSignal<number>();

    createEffect(() => {
        // Should re-run after every sync
        if (!state.is_syncing) {
            refetch();
        }
    });

    async function createConnection(f: BudgetForm) {
        let newProfile: NwcProfile | undefined = undefined;

        // If the form was editing, we want to call the edit methods
        if (profileToOpen()) {
            if (!f.auto_approve || f.budget_amount === "0") {
                newProfile =
                    await state.mutiny_wallet?.set_nwc_profile_require_approval(
                        profileToOpen()!.index
                    );
            } else {
                newProfile = await state.mutiny_wallet?.set_nwc_profile_budget(
                    profileToOpen()!.index,
                    BigInt(f.budget_amount),
                    mapIntervalToBudgetPeriod(f.interval)
                );
            }
        } else {
            if (!f.auto_approve || f.budget_amount === "0") {
                newProfile = await state.mutiny_wallet?.create_nwc_profile(
                    f.connection_name
                );
            } else {
                newProfile =
                    await state.mutiny_wallet?.create_budget_nwc_profile(
                        f.connection_name,
                        BigInt(f.budget_amount),
                        mapIntervalToBudgetPeriod(f.interval),
                        undefined
                    );
            }
        }

        if (!newProfile) {
            // This will be caught by the form
            throw new Error(i18n.t("settings.connections.error_connection"));
        } else {
            // Remember the index so the collapser is open after creation
            setNewConnection(newProfile.index);
            refetch();
        }

        setSearchParams({ name: "" });
        setDialogOpen(false);

        const callbackUriScheme = searchParams.callbackUri;
        if (callbackUriScheme) {
            const fullURI = newProfile.nwc_uri.replace(
                "nostr+walletconnect://",
                `${callbackUriScheme}://`
            );
            setCallbackUri(fullURI);
            setCallbackDialogOpen(true);
        }
    }

    function openCallbackUri() {
        openLinkProgrammatically(callbackUri());
        setSearchParams({ callbackUri: "" });
        setCallbackDialogOpen(false);
    }

    return (
        <VStack biggap>
            <Button intent="blue" onClick={createProfile}>
                {i18n.t("settings.connections.add_connection")}
            </Button>
            <Show when={nwcProfiles() && nwcProfiles()!.length > 0}>
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
                setOpen={setDialogOpen}
                title={
                    profileToOpen()
                        ? i18n.t("settings.connections.edit_connection")
                        : i18n.t("settings.connections.add_connection")
                }
            >
                <NWCBudgetEditor
                    initialName={queryName}
                    initialProfile={profileToOpen()}
                    onSave={createConnection}
                />
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

export default function Connections() {
    const i18n = useI18n();
    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink
                        href="/settings"
                        title={i18n.t("settings.header")}
                    />
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
