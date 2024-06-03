import { TagItem } from "@mutinywallet/mutiny-wasm";
import { cache, createAsync, useNavigate } from "@solidjs/router";
import { Scan, Search } from "lucide-solid";
import { For, Suspense } from "solid-js";

import { Circle, LabelCircle, showToast } from "~/components";
import { useMegaStore } from "~/state/megaStore";

export function SocialActionRow(props: {
    onSearch: () => void;
    onScan: () => void;
}) {
    const [_state, actions, sw] = useMegaStore();
    const navigate = useNavigate();

    const getContacts = cache(async () => {
        try {
            const contacts = await sw.get_contacts_sorted(40);
            const myNpub = (await sw.get_npub()) || "";

            // contact must have a npub, ln_address, or lnurl
            return contacts.filter(
                (contact) =>
                    (contact.npub !== undefined ||
                        contact.ln_address !== undefined ||
                        contact.lnurl !== undefined) &&
                    contact.npub !== myNpub
            );
        } catch (e) {
            console.error(e);
            return [];
        }
    }, "contacts");

    const contacts = createAsync(() => getContacts(), { initialValue: [] });

    const profileDeleted = createAsync(async () => {
        const profile = await sw.get_nostr_profile();
        return profile?.deleted;
    });

    // TODO this is mostly copy pasted from chat, could be a shared util maybe
    async function sendToContact(contact?: TagItem) {
        if (!contact) return;
        const address = contact.ln_address || contact.lnurl;
        if (address) {
            await actions.handleIncomingString(
                (address || "").trim(),
                (error) => {
                    showToast(error);
                },
                (result) => {
                    actions.setScanResult({
                        ...result,
                        contact_id: contact.id
                    });
                    navigate("/send");
                }
            );
        } else {
            console.error("no ln_address or lnurl");
        }
    }

    async function handleClick(contact: TagItem) {
        if (profileDeleted() || !contact.npub) {
            sendToContact(contact);
        } else {
            navigate(`/chat/${contact.id}`);
        }
    }

    return (
        <div class="-ml-4 -mr-4 flex gap-2 overflow-x-scroll py-[1px] pl-4">
            <Circle color="red" onClick={props.onSearch}>
                <Search />
            </Circle>
            <Circle onClick={props.onScan}>
                <Scan />
            </Circle>
            <Suspense>
                <For each={contacts()}>
                    {(contact) => (
                        <LabelCircle
                            contact
                            label={false}
                            name={contact.name}
                            image_url={contact.primal_image_url}
                            onClick={() => handleClick(contact)}
                        />
                    )}
                </For>
            </Suspense>
        </div>
    );
}
