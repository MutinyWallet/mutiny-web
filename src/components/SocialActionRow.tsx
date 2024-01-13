import { cache, createAsync, useNavigate } from "@solidjs/router";
import { Scan, Search } from "lucide-solid";
import { For, Suspense } from "solid-js";

import { Circle, LabelCircle } from "~/components";
import { useMegaStore } from "~/state/megaStore";

export function SocialActionRow(props: {
    onSearch: () => void;
    onScan: () => void;
}) {
    const [state, _actions] = useMegaStore();
    const navigate = useNavigate();

    const getContacts = cache(async () => {
        try {
            const contacts = await state.mutiny_wallet?.get_contacts_sorted();
            return contacts || [];
        } catch (e) {
            console.error(e);
            return [];
        }
    }, "contacts");

    const contacts = createAsync(() => getContacts(), { initialValue: [] });

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
                            onClick={() => {
                                navigate(`/chat/${contact.id}`);
                            }}
                        />
                    )}
                </For>
            </Suspense>
        </div>
    );
}
