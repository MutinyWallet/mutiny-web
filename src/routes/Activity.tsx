import { For, Show, createResource } from "solid-js";
import NavBar from "~/components/NavBar";
import { Button, Card, DefaultMain, LargeHeader, NiceP, MutinyWalletGuard, SafeArea, VStack } from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import { CombinedActivity } from "~/components/Activity";
import { A } from "solid-start";
import settings from '~/assets/icons/settings.svg';
import { Tabs } from "@kobalte/core";
import { gradientsPerContact } from "~/utils/gradientHash";
import { ContactEditor } from "~/components/ContactEditor";
import { ContactFormValues, ContactViewer } from "~/components/ContactViewer";
import { useMegaStore } from "~/state/megaStore";
import { Contact } from "@mutinywallet/mutiny-wasm";
import { showToast } from "~/components/Toaster";

function ContactRow() {
    const [state, actions] = useMegaStore();
    const [contacts, { refetch }] = createResource(async () => {
        const contacts = state.mutiny_wallet?.get_contacts();
        console.log(contacts)

        let c: Contact[] = []
        if (contacts) {
            for (let contact in contacts) {
                c.push(contacts[contact])
            }
        }
        return c || []
    })
    const [gradients] = createResource(contacts, gradientsPerContact);

    async function createContact(contact: ContactFormValues) {
        const c = new Contact(contact.name, contact.npub ?? undefined, undefined, undefined);
        await state.mutiny_wallet?.create_new_contact(c)
        refetch();
    }

    // 
    async function saveContact(contact: ContactFormValues) {
        showToast(new Error("Unimplemented"))
        // await editContact(contact)
        refetch();
    }

    return (
        <div class="w-full overflow-x-scroll flex gap-4 disable-scrollbars">
            <ContactEditor list createContact={createContact} />
            <Show when={contacts() && gradients()}>
                <For each={contacts()}>
                    {(contact) => (
                        <ContactViewer contact={contact} gradient={gradients()?.get(contact.name)} saveContact={saveContact} />
                    )}
                </For>
            </Show>
        </div>
    )
}

const TAB = "flex-1 inline-block px-8 py-4 text-lg font-semibold rounded-lg ui-selected:bg-white/10 bg-neutral-950 hover:bg-white/10"

export default function Activity() {
    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink />
                    <LargeHeader action={<A class="md:hidden p-2 hover:bg-white/5 rounded-lg active:bg-m-blue" href="/settings"><img src={settings} alt="Settings" /></A>}>Activity</LargeHeader>
                    <ContactRow />

                    <Tabs.Root defaultValue="mutiny">
                        <Tabs.List class="relative flex justify-around mt-4 mb-8 gap-1 bg-neutral-950 p-1 rounded-xl">
                            <Tabs.Trigger value="mutiny" class={TAB}>Mutiny</Tabs.Trigger>
                            <Tabs.Trigger value="nostr" class={TAB}>Nostr</Tabs.Trigger>
                            {/* <Tabs.Indicator class="absolute bg-m-blue transition-all bottom-[-1px] h-[2px]" /> */}
                        </Tabs.List>
                        <Tabs.Content value="mutiny">
                            {/* <MutinyActivity /> */}
                            <Card title="Activity">
                                <div class="p-1" />
                                <VStack>
                                    <CombinedActivity />
                                </VStack>
                            </Card>
                        </Tabs.Content>
                        <Tabs.Content value="nostr">
                            <VStack>
                                <div class="my-8 flex flex-col items-center gap-4 text-center max-w-[20rem] mx-auto">
                                    <NiceP>Import your contacts from nostr to see who they're zapping.</NiceP>
                                    <Button disabled intent="blue">Coming soon</Button>
                                </div>
                            </VStack>
                        </Tabs.Content>
                    </Tabs.Root>
                </DefaultMain>
                <NavBar activeTab="activity" />
            </SafeArea>
        </MutinyWalletGuard>
    )
}