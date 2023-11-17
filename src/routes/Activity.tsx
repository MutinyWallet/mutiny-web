import { Tabs } from "@kobalte/core";
import { TagItem } from "@mutinywallet/mutiny-wasm";
import {
    createEffect,
    createResource,
    ErrorBoundary,
    For,
    Match,
    Show,
    Suspense,
    Switch
} from "solid-js";

import {
    BackLink,
    Card,
    CombinedActivity,
    ContactEditor,
    ContactFormValues,
    ContactViewer,
    DefaultMain,
    LargeHeader,
    LoadingShimmer,
    MutinyWalletGuard,
    NavBar,
    NiceP,
    NostrActivity,
    SafeArea,
    showToast,
    SimpleErrorDisplay,
    SyncContactsForm,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify, gradientsPerContact, hexpubFromNpub } from "~/utils";

function ContactRow() {
    const [state, _actions] = useMegaStore();
    const [contacts, { refetch }] = createResource(async () => {
        try {
            const contacts: TagItem[] =
                state.mutiny_wallet?.get_contacts_sorted();
            return contacts || [];
        } catch (e) {
            console.error(e);
            return [];
        }
    });

    // If the user sets an npub we should refetch the contacts list
    createEffect(() => {
        if (state.npub) {
            refetch();
        }
    });
    const [gradients] = createResource(contacts, gradientsPerContact);

    async function createContact(contact: ContactFormValues) {
        try {
            await state.mutiny_wallet?.create_new_contact(
                contact.name,
                contact.npub ? contact.npub.trim() : undefined,
                contact.ln_address ? contact.ln_address.trim() : undefined,
                undefined,
                undefined
            );
        } catch (e) {
            console.error(e);
        }
        refetch();
    }

    //
    async function saveContact(id: string, contact: ContactFormValues) {
        console.log("saving contact", id, contact);
        const hexpub = await hexpubFromNpub(contact.npub?.trim());
        try {
            const existing = state.mutiny_wallet?.get_tag_item(id);
            // This shouldn't happen
            if (!existing) throw new Error("No existing contact");
            await state.mutiny_wallet?.edit_contact(
                id,
                contact.name,
                hexpub ? hexpub : undefined,
                contact.ln_address ? contact.ln_address.trim() : undefined,
                existing.lnurl,
                existing.image_url
            );
        } catch (e) {
            console.error(e);
            showToast(eify(e));
        }

        refetch();
    }

    return (
        <div class="flex gap-4">
            <ContactEditor list createContact={createContact} />
            <Show when={contacts()}>
                <div class="flex flex-1 gap-4 overflow-x-scroll disable-scrollbars">
                    <For each={contacts()}>
                        {(contact) => (
                            <ContactViewer
                                contact={contact}
                                gradient={gradients()?.get(contact.name)}
                                saveContact={saveContact}
                            />
                        )}
                    </For>
                </div>
            </Show>
        </div>
    );
}

const TAB =
    "flex-1 inline-block px-8 py-4 text-lg font-semibold rounded-lg ui-selected:bg-white/10 bg-neutral-950 hover:bg-white/10";

export function Activity() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();
    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink />
                    <LargeHeader>{i18n.t("activity.title")}</LargeHeader>
                    <ContactRow />
                    <Tabs.Root defaultValue="mutiny">
                        <Tabs.List class="relative mb-8 mt-4 flex justify-around gap-1 rounded-xl bg-neutral-950 p-1">
                            <Tabs.Trigger value="wallet" class={TAB}>
                                {i18n.t("activity.wallet")}
                            </Tabs.Trigger>
                            <Tabs.Trigger value="nostr" class={TAB}>
                                {i18n.t("activity.nostr")}
                            </Tabs.Trigger>
                            {/* <Tabs.Indicator class="absolute bg-m-blue transition-all bottom-[-1px] h-[2px]" /> */}
                        </Tabs.List>
                        <Tabs.Content value="wallet">
                            {/* <MutinyActivity /> */}
                            <Card title={i18n.t("activity.title")}>
                                <div class="p-1" />
                                <VStack>
                                    <Suspense>
                                        <Show
                                            when={!state.wallet_loading}
                                            fallback={<LoadingShimmer />}
                                        >
                                            <CombinedActivity />
                                        </Show>
                                    </Suspense>
                                </VStack>
                            </Card>
                        </Tabs.Content>
                        <Tabs.Content value="nostr">
                            <Switch>
                                <Match when={state.npub}>
                                    <ErrorBoundary
                                        fallback={(e) => (
                                            <SimpleErrorDisplay error={e} />
                                        )}
                                    >
                                        <Suspense fallback={<LoadingShimmer />}>
                                            <NostrActivity />
                                        </Suspense>
                                    </ErrorBoundary>
                                </Match>
                                <Match when={!state.npub}>
                                    <VStack>
                                        <NiceP>
                                            {i18n.t("activity.import_contacts")}
                                        </NiceP>
                                        <SyncContactsForm />
                                    </VStack>
                                </Match>
                            </Switch>
                        </Tabs.Content>
                    </Tabs.Root>
                </DefaultMain>
                <NavBar activeTab="activity" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
