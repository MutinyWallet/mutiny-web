import { NwcProfile } from "@mutinywallet/mutiny-wasm";
import { For, Show, createResource, createSignal } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";
import { KeyValue, MiniStringShower } from "~/components/DetailsModal";
import { InfoBox } from "~/components/InfoBox";
import NavBar from "~/components/NavBar";
import { ShareCard } from "~/components/ShareCard";
import {
    Button,
    Collapser,
    DefaultMain,
    LargeHeader,
    MutinyWalletGuard,
    NiceP,
    SafeArea,
    SettingsCard,
    SimpleDialog,
    VStack
} from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import { TextField } from "~/components/layout/TextField";
import { useMegaStore } from "~/state/megaStore";
import eify from "~/utils/eify";

function Nwc() {
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

    const [dialogOpen, setDialogOpen] = createSignal(false);
    const [formName, setFormName] = createSignal("");
    const [createLoading, setCreateLoading] = createSignal(false);
    const [error, setError] = createSignal("");

    async function createConnection() {
        try {
            setError("");
            setCreateLoading(true);

            if (formName() === "") {
                setError("Name cannot be empty");
                return;
            }
            const profile = await state.mutiny_wallet?.create_nwc_profile(
                formName(),
                10000n
            );

            if (!profile) {
                setError("Failed to create Wallet Connection");
                return;
            } else {
                refetch();
            }

            setFormName("");
            setDialogOpen(false);
        } catch (e) {
            setError(eify(e).message);
            console.error(e);
        } finally {
            setCreateLoading(false);
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

    return (
        <VStack biggap>
            <Button intent="blue" onClick={() => setDialogOpen(true)}>
                Add Connection
            </Button>
            <Show when={nwcProfiles() && nwcProfiles()!.length > 0}>
                <SettingsCard title="Manage Connections">
                    <For each={nwcProfiles()}>
                        {(profile) => (
                            <Collapser
                                title={profile.name}
                                activityLight={profile.enabled ? "on" : "off"}
                            >
                                <VStack>
                                    <KeyValue key="Relay">
                                        <MiniStringShower
                                            text={profile.relay}
                                        />
                                    </KeyValue>

                                    <div class="w-full bg-white rounded-xl">
                                        <QRCodeSVG
                                            value={profile.nwc_uri}
                                            class="w-full h-full p-8 max-h-[320px]"
                                        />
                                    </div>
                                    <ShareCard text={profile.nwc_uri || ""} />
                                    <Button
                                        layout="small"
                                        onClick={() => toggleEnabled(profile)}
                                    >
                                        {profile.enabled ? "Disable" : "Enable"}
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
                title="New Connection"
            >
                <div class="flex flex-col gap-4 py-4">
                    <TextField
                        name="name"
                        label="Name"
                        ref={noop}
                        value={formName()}
                        onInput={(e) => setFormName(e.currentTarget.value)}
                        error={""}
                        onBlur={noop}
                        onChange={noop}
                        placeholder="My favorite nostr client..."
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
                    Create Connection
                </Button>
            </SimpleDialog>
        </VStack>
    );
}

export default function Connections() {
    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink href="/settings" title="Settings" />
                    <LargeHeader>Wallet Connections</LargeHeader>
                    <NiceP>
                        Authorize external services to request payments from
                        your wallet. Pairs great with Nostr clients.
                    </NiceP>
                    <Nwc />
                    <div class="h-full" />
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
