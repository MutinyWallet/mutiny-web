import { A, createAsync } from "@solidjs/router";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { Import, Trash, Unlink } from "lucide-solid";
import { createResource, createSignal, Match, Show, Switch } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";

import {
    BackPop,
    ConfirmDialog,
    DefaultMain,
    ExternalLink,
    FancyCard,
    KeyValue,
    LargeHeader,
    MiniStringShower,
    MutinyWalletGuard,
    NavBar,
    NiceP,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

function DeleteAccount() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    async function confirmDelete() {
        setConfirmOpen(true);
    }

    const [confirmOpen, setConfirmOpen] = createSignal(false);
    const [confirmLoading, setConfirmLoading] = createSignal(false);

    async function deleteNostrAccount() {
        setConfirmLoading(true);
        try {
            await state.mutiny_wallet?.delete_profile();
            // Remove the nsec from secure storage if it exists
            await SecureStoragePlugin.clear();
            window.location.href = "/";
        } catch (e) {
            console.error(e);
        }
        setConfirmLoading(false);
    }

    return (
        <>
            <button
                class="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-900 p-2 text-m-red  no-underline active:-mb-[1px] active:mt-[1px] active:opacity-70"
                onClick={confirmDelete}
            >
                <Trash class="w-4" />
                {i18n.t("settings.nostr_keys.delete_account")}
            </button>
            <ConfirmDialog
                loading={confirmLoading()}
                open={confirmOpen()}
                onConfirm={deleteNostrAccount}
                onCancel={() => setConfirmOpen(false)}
            >
                <p>{i18n.t("settings.nostr_keys.delete_account_confirm")}</p>
                <p class="font-semibold">
                    {i18n.t("settings.nostr_keys.delete_account_confirm_scary")}
                </p>
            </ConfirmDialog>
        </>
    );
}

function UnlinkAccount() {
    const i18n = useI18n();

    async function confirmUnlink() {
        setConfirmOpen(true);
    }

    const [confirmOpen, setConfirmOpen] = createSignal(false);
    const [confirmLoading, setConfirmLoading] = createSignal(false);

    async function unlinkNostrAccount() {
        setConfirmLoading(true);
        try {
            await SecureStoragePlugin.clear();
            window.location.href = "/";
        } catch (e) {
            console.error(e);
        }
        setConfirmLoading(false);
    }

    return (
        <>
            <button
                class="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-900 p-2 text-m-grey-350  no-underline active:-mb-[1px] active:mt-[1px] active:opacity-70"
                onClick={confirmUnlink}
            >
                <Unlink class="w-4" />
                {i18n.t("settings.nostr_keys.unlink_account")}
            </button>
            <ConfirmDialog
                loading={confirmLoading()}
                open={confirmOpen()}
                onConfirm={unlinkNostrAccount}
                onCancel={() => setConfirmOpen(false)}
            >
                {i18n.t("settings.nostr_keys.unlink_account_confirm")}
            </ConfirmDialog>
        </>
    );
}

export function NostrKeys() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const npub = createAsync(async () => state.mutiny_wallet?.get_npub());
    const nsec = createAsync(async () => state.mutiny_wallet?.export_nsec());
    const profile = () => state.mutiny_wallet?.get_nostr_profile();

    // @ts-expect-error we're checking for an extension
    const windowHasNostr = window.nostr && window.nostr.getPublicKey;

    const [nsecInSecureStorage] = createResource(async () => {
        try {
            const value = await SecureStoragePlugin.get({ key: "nsec" });
            if (value) return true;
        } catch (e) {
            console.log("No nsec stored");
            return false;
        }
    });

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <BackPop default="/settings" />
                <LargeHeader>{i18n.t("settings.nostr_keys.title")}</LargeHeader>
                <NiceP>{i18n.t("settings.nostr_keys.description")}</NiceP>
                <NiceP>
                    <ExternalLink href="https://nostr.com/">
                        {i18n.t("settings.nostr_keys.learn_more")}
                    </ExternalLink>
                </NiceP>
                <Switch>
                    <Match when={profile() && !profile().deleted}>
                        <FancyCard>
                            <VStack>
                                <div class="w-[10rem] self-center rounded bg-white p-[1rem]">
                                    <QRCodeSVG
                                        value={npub() || ""}
                                        class="h-full max-h-[256px] w-full"
                                    />
                                </div>
                                <KeyValue key="Public Key">
                                    <MiniStringShower text={npub() || ""} />
                                </KeyValue>
                                <Show when={nsec()}>
                                    <KeyValue key="Private Key">
                                        <MiniStringShower
                                            text={nsec() || ""}
                                            hide
                                        />
                                    </KeyValue>
                                    <p class="text-base italic text-m-grey-350">
                                        {i18n.t("settings.nostr_keys.warning")}
                                    </p>
                                </Show>
                            </VStack>
                        </FancyCard>
                        <Show when={!windowHasNostr}>
                            <A
                                href="/settings/importprofile"
                                class="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-900 p-2 text-m-grey-350 no-underline active:-mb-[1px] active:mt-[1px] active:opacity-70"
                            >
                                <Import class="w-4" />
                                {i18n.t("settings.nostr_keys.import_profile")}
                            </A>
                        </Show>
                        <Switch>
                            <Match when={nsecInSecureStorage()}>
                                <UnlinkAccount />
                            </Match>
                            <Match
                                when={!nsecInSecureStorage() && !windowHasNostr}
                            >
                                <DeleteAccount />
                            </Match>
                        </Switch>
                    </Match>
                    <Match when={profile() && profile().deleted}>
                        <A
                            href="/settings/importprofile"
                            class="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-900 p-2 text-m-grey-350 no-underline active:-mb-[1px] active:mt-[1px] active:opacity-70"
                        >
                            <Import class="w-4" />
                            {i18n.t("settings.nostr_keys.import_profile")}
                        </A>
                    </Match>
                </Switch>
            </DefaultMain>
            <NavBar activeTab="settings" />
        </MutinyWalletGuard>
    );
}
