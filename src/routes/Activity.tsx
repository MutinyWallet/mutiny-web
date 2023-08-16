import { Tabs } from "@kobalte/core";
import { Contact } from "@johncantrell97/mutiny-wasm";
import { createResource, For, Show, Suspense } from "solid-js";

import {
    BackLink,
    Button,
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
    SafeArea,
    showToast,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { gradientsPerContact } from "~/utils/gradientHash";

function ContactRow() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();
    const [contacts, { refetch }] = createResource(async () => {
        try {
            const contacts = state.mutiny_wallet?.get_contacts();

            // FIXME: this is just types shenanigans I believe
            const c: Contact[] = [];
            if (contacts) {
                for (const contact in contacts) {
                    c.push(contacts[contact]);
                }
            }
            return c || [];
        } catch (e) {
            console.error(e);
            return [];
        }
    });
    const [gradients] = createResource(contacts, gradientsPerContact);

    async function createContact(contact: ContactFormValues) {
        // FIXME: npub not valid? other undefineds
        const c = new Contact(contact.name, undefined, undefined, undefined);
        try {
            await state.mutiny_wallet?.create_new_contact(c);
        } catch (e) {
            console.error(e);
        }
        refetch();
    }

    //
    async function saveContact(_contact: ContactFormValues) {
        showToast(new Error(i18n.t("common.error_unimplemented")));
        // await editContact(contact)
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

export default function Activity() {
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
                            <Tabs.Trigger value="mutiny" class={TAB}>
                                {i18n.t("activity.mutiny")}
                            </Tabs.Trigger>
                            <Tabs.Trigger value="nostr" class={TAB}>
                                {i18n.t("activity.nostr")}
                            </Tabs.Trigger>
                            {/* <Tabs.Indicator class="absolute bg-m-blue transition-all bottom-[-1px] h-[2px]" /> */}
                        </Tabs.List>
                        <Tabs.Content value="mutiny">
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
                            <VStack>
                                <div class="mx-auto my-8 flex max-w-[20rem] flex-col items-center gap-4 text-center">
                                    <NiceP>
                                        {i18n.t("activity.import_contacts")}
                                    </NiceP>
                                    <Button disabled intent="blue">
                                        {i18n.t("activity.coming_soon")}
                                    </Button>
                                </div>
                            </VStack>
                        </Tabs.Content>
                    </Tabs.Root>
                </DefaultMain>
                <NavBar activeTab="activity" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
