import { NwcProfile } from "@mutinywallet/mutiny-wasm";
import { createResource, createSignal, For, Show } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";

import {
    BackLink,
    Button,
    Collapser,
    DefaultMain,
    InfoBox,
    KeyValue,
    LargeHeader,
    MiniStringShower,
    MutinyWalletGuard,
    NavBar,
    NiceP,
    SafeArea,
    SettingsCard,
    ShareCard,
    SimpleDialog,
    TextField,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import eify from "~/utils/eify";

function Nwc() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const [nwcProfiles, { refetch }] = createResource(async () => {
        try {
            const profiles: NwcProfile[] =
                await state.mutiny_wallet?.get_nwc_profiles();

            return profiles;
        } catch (e) {
            console.error(e);
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const queryName = urlParams.get("name");
    const [formName, setFormName] = createSignal(queryName || "");
    const [dialogOpen, setDialogOpen] = createSignal(!!queryName);
    const [createLoading, setCreateLoading] = createSignal(false);
    const [error, setError] = createSignal("");
    const [callbackDialogOpen, setCallbackDialogOpen] = createSignal(false);
    const [callbackUri, setCallbackUri] = createSignal<string | null>(null);

    async function createConnection() {
        try {
            setError("");
            setCreateLoading(true);

            if (formName() === "") {
                setError(i18n.t("settings.connections.error_name"));
                return;
            }
            const profile = await state.mutiny_wallet?.create_nwc_profile(
                formName()
            );

            if (!profile) {
                setError(i18n.t("settings.connections.error_connection"));
                return;
            } else {
                refetch();
            }

            setFormName("");
            setDialogOpen(false);

            const callbackUriScheme = getCallbackQueryParam();
            if (callbackUriScheme) {
                const fullURI = profile.nwc_uri.replace(
                    "nostr+walletconnect://",
                    `${getCallbackQueryParam()}://`
                );
                setCallbackUri(fullURI);
                setCallbackDialogOpen(true);
            }
        } catch (e) {
            setError(eify(e).message);
            console.error(e);
        } finally {
            setCreateLoading(false);
        }
    }

    function openCallbackUri() {
        if (callbackUri()) {
            window.open(callbackUri() as string, "_blank");
            setCallbackDialogOpen(false);
        }
    }

    async function toggleEnabled(profile: NwcProfile) {
        try {
            await state.mutiny_wallet?.edit_nwc_profile({
                ...profile,
                enabled: !profile.enabled
            });
            refetch();
        } catch (e) {
            console.error(e);
        }
    }

    // this is because the TextField component has a bunch of required props
    function noop() {
        // do nothing
        return;
    }

    function openInNostrClient(uri: string) {
        window.open(uri, "_blank");
    }

    function openInPrimal(uri: string) {
        const connectString = uri.replace("nostr+walletconnect", "primal");
        window.open(connectString, "_blank");
    }

    function getCallbackQueryParam() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("callbackUri");
    }

    return (
        <VStack biggap>
            <Button intent="blue" onClick={() => setDialogOpen(true)}>
                {i18n.t("settings.connections.add_connection")}
            </Button>
            <Show when={nwcProfiles() && nwcProfiles()!.length > 0}>
                <SettingsCard
                    title={i18n.t("settings.connections.manage_connections")}
                >
                    <For each={nwcProfiles()}>
                        {(profile) => (
                            <Collapser
                                title={profile.name}
                                activityLight={profile.enabled ? "on" : "off"}
                            >
                                <VStack>
                                    <KeyValue
                                        key={i18n.t(
                                            "settings.connections.relay"
                                        )}
                                    >
                                        <MiniStringShower
                                            text={profile.relay}
                                        />
                                    </KeyValue>

                                    <div class="w-full rounded-xl bg-white">
                                        <QRCodeSVG
                                            value={profile.nwc_uri}
                                            class="h-full max-h-[320px] w-full p-8"
                                        />
                                    </div>
                                    <ShareCard text={profile.nwc_uri || ""} />

                                    <Button
                                        layout="small"
                                        onClick={() =>
                                            openInNostrClient(profile.nwc_uri)
                                        }
                                    >
                                        Open in Nostr Client
                                    </Button>

                                    <Button
                                        layout="small"
                                        onClick={() =>
                                            openInPrimal(profile.nwc_uri)
                                        }
                                    >
                                        Open in Primal
                                    </Button>

                                    <Button
                                        layout="small"
                                        onClick={() => toggleEnabled(profile)}
                                    >
                                        {profile.enabled
                                            ? i18n.t(
                                                  "settings.connections.disable_connection"
                                              )
                                            : i18n.t(
                                                  "settings.connections.enable_connection"
                                              )}
                                    </Button>
                                </VStack>
                            </Collapser>
                        )}
                    </For>
                </SettingsCard>
            </Show>
            <SimpleDialog
                open={dialogOpen()}
                setOpen={setDialogOpen}
                title={i18n.t("settings.connections.new_connection")}
            >
                <div class="flex flex-col gap-4 py-4">
                    <TextField
                        name="name"
                        label={i18n.t(
                            "settings.connections.new_connection_label"
                        )}
                        ref={noop}
                        value={formName()}
                        onInput={(e) => setFormName(e.currentTarget.value)}
                        error={""}
                        onBlur={noop}
                        onChange={noop}
                        placeholder={i18n.t(
                            "settings.connections.new_connection_placeholder"
                        )}
                    />
                    <Show when={error()}>
                        <InfoBox accent="red">{error()}</InfoBox>
                    </Show>
                </div>

                <Button
                    intent="blue"
                    loading={createLoading()}
                    onClick={createConnection}
                >
                    {i18n.t("settings.connections.create_connection")}
                </Button>
            </SimpleDialog>
            <SimpleDialog
                open={callbackDialogOpen()}
                setOpen={setCallbackDialogOpen}
                title={"Open in App"}
            >
                <p>Click the button below to open in the app.</p>
                <Button onClick={openCallbackUri}>Open in App</Button>
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
