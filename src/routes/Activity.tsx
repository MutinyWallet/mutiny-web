import { For, Show, Suspense, createResource } from "solid-js";
import NavBar from "~/components/NavBar";
import {
    Button,
    Card,
    DefaultMain,
    LargeHeader,
    NiceP,
    MutinyWalletGuard,
    SafeArea,
    VStack
} from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import { CombinedActivity } from "~/components/Activity";
import { Tabs } from "@kobalte/core";
import { gradientsPerContact } from "~/utils/gradientHash";
import { ContactEditor } from "~/components/ContactEditor";
import { ContactFormValues, ContactViewer } from "~/components/ContactViewer";
import { useMegaStore } from "~/state/megaStore";
import { Contact } from "@mutinywallet/mutiny-wasm";
import { showToast } from "~/components/Toaster";
import { LoadingShimmer } from "~/components/BalanceBox";

function ContactRow() {
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
        showToast(new Error("Unimplemented"));
        // await editContact(contact)
        refetch();
    }

    return (
        <div class="flex gap-4">
            <ContactEditor list createContact={createContact} />
            <Show when={contacts()}>
                <div class="flex gap-4 flex-1 overflow-x-scroll disable-scrollbars">
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
    const [state, _actions] = useMegaStore();
    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink />
                    <LargeHeader>Activity</LargeHeader>
                    <ContactRow />
                    <Tabs.Root defaultValue="mutiny">
                        <Tabs.List class="relative flex justify-around mt-4 mb-8 gap-1 bg-neutral-950 p-1 rounded-xl">
                            <Tabs.Trigger value="mutiny" class={TAB}>
                                Mutiny
                            </Tabs.Trigger>
                            <Tabs.Trigger value="nostr" class={TAB}>
                                Nostr
                            </Tabs.Trigger>
                            {/* <Tabs.Indicator class="absolute bg-m-blue transition-all bottom-[-1px] h-[2px]" /> */}
                        </Tabs.List>
                        <Tabs.Content value="mutiny">
                            {/* <MutinyActivity /> */}
                            <Card title="Activity">
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
                                <div class="my-8 flex flex-col items-center gap-4 text-center max-w-[20rem] mx-auto">
                                    <NiceP>
                                        Import your contacts from nostr to see
                                        who they're zapping.
                                    </NiceP>
                                    <Button disabled intent="blue">
                                        Coming soon
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
