import { Clipboard } from "@capacitor/clipboard";
import { Capacitor } from "@capacitor/core";
import { TagItem } from "@mutinywallet/mutiny-wasm";
import { A, useNavigate } from "@solidjs/router";
import {
    createMemo,
    createResource,
    createSignal,
    For,
    Match,
    onMount,
    Show,
    Suspense,
    Switch
} from "solid-js";

import close from "~/assets/icons/close.svg";
import paste from "~/assets/icons/paste.svg";
import scan from "~/assets/icons/scan.svg";
import {
    ContactEditor,
    ContactFormValues,
    LabelCircle,
    LoadingShimmer,
    NavBar,
    showToast
} from "~/components";
import {
    BackLink,
    Button,
    DefaultMain,
    MutinyWalletGuard,
    SafeArea
} from "~/components/layout";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import {
    actuallyFetchNostrProfile,
    hexpubFromNpub,
    profileToPseudoContact,
    PseudoContact,
    searchProfiles
} from "~/utils";

export function Search() {
    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain zeroBottomPadding={true}>
                    <div class="flex items-center justify-between">
                        <BackLink />
                        <A
                            class="rounded-lg p-2 hover:bg-white/5 active:bg-m-blue md:hidden"
                            href="/scanner"
                        >
                            <img src={scan} alt="Scan" class="h-6 w-6" />
                        </A>{" "}
                    </div>
                    {/* Need to put the search view in a supsense so it loads list on first nav */}
                    <Suspense>
                        <ActualSearch />
                    </Suspense>
                </DefaultMain>
                <NavBar activeTab="send" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}

function ActualSearch() {
    const [searchValue, setSearchValue] = createSignal("");
    const [state, actions] = useMegaStore();
    const navigate = useNavigate();
    const i18n = useI18n();

    async function contactsFetcher() {
        try {
            const contacts: TagItem[] =
                state.mutiny_wallet?.get_contacts_sorted();
            return contacts || [];
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    const [contacts] = createResource(contactsFetcher);

    const filteredContacts = createMemo(() => {
        const s = searchValue().toLowerCase();
        return (
            contacts()?.filter((c) => {
                return (
                    c.ln_address &&
                    (c.name.toLowerCase().includes(s) ||
                        c.ln_address?.toLowerCase().includes(s) ||
                        c.npub?.includes(s))
                );
            }) || []
        );
    });

    const foundNpubs = createMemo(() => {
        return (
            filteredContacts()
                ?.map((c) => c.npub)
                .filter((n) => !!n) || []
        );
    });

    const showSendButton = createMemo(() => {
        if (searchValue() === "") {
            return false;
        } else {
            const text = searchValue().trim();
            // Only want to check for something parseable if it's of reasonable length
            if (text.length < 6) {
                return false;
            }
            let success = false;
            actions.handleIncomingString(
                text,
                (_error) => {
                    // noop
                },
                (_result) => {
                    success = true;
                }
            );
            return success;
        }
    });

    function handleContinue() {
        actions.handleIncomingString(
            searchValue().trim(),
            (error) => {
                showToast(error);
            },
            (result) => {
                if (result) {
                    actions.setScanResult(result);
                    navigate("/send", { state: { previous: "/search" } });
                } else {
                    showToast(new Error(i18n.t("send.error_address")));
                }
            }
        );
    }

    function sendToContact(contact: TagItem) {
        const address = contact.ln_address || contact.lnurl;
        if (address) {
            actions.handleIncomingString(
                (address || "").trim(),
                (error) => {
                    showToast(error);
                },
                (result) => {
                    actions.setScanResult({
                        ...result,
                        contact_id: contact.id
                    });
                    navigate("/send", { state: { previous: "/search" } });
                }
            );
        } else {
            console.error("no ln_address or lnurl");
        }
    }

    async function createContact(contact: ContactFormValues) {
        try {
            const contactId = await state.mutiny_wallet?.create_new_contact(
                contact.name,
                contact.npub ? contact.npub.trim() : undefined,
                contact.ln_address ? contact.ln_address.trim() : undefined,
                undefined,
                undefined
            );

            if (!contactId) {
                throw new Error("no contact id returned");
            }

            const tagItem = await state.mutiny_wallet?.get_tag_item(contactId);

            if (!tagItem) {
                throw new Error("no contact returned");
            }

            sendToContact(tagItem);
        } catch (e) {
            console.error(e);
        }
    }

    // Search input stuff
    async function handlePaste() {
        try {
            let text;

            if (Capacitor.isNativePlatform()) {
                const { value } = await Clipboard.read();
                text = value;
            } else {
                if (!navigator.clipboard.readText) {
                    return showToast(new Error(i18n.t("send.error_clipboard")));
                }
                text = await navigator.clipboard.readText();
            }

            const trimText = text.trim();
            setSearchValue(trimText);
            parsePaste(trimText);
        } catch (e) {
            console.error(e);
        }
    }

    function parsePaste(text: string) {
        actions.handleIncomingString(
            text,
            (error) => {
                showToast(error);
            },
            (result) => {
                actions.setScanResult(result);
                navigate("/send", { state: { previous: "/search" } });
            }
        );
    }

    let searchInputRef!: HTMLInputElement;

    onMount(() => {
        searchInputRef.focus();
    });

    return (
        <>
            <div class="relative">
                <input
                    class="w-full rounded-lg bg-m-grey-750 p-2 placeholder-m-grey-400 disabled:text-m-grey-400"
                    type="text"
                    value={searchValue()}
                    onInput={(e) => setSearchValue(e.currentTarget.value)}
                    placeholder="Name, address, invoice..."
                    autofocus
                    ref={(el) => (searchInputRef = el)}
                />
                <Show when={!searchValue()}>
                    <button
                        class="bg-m-grey- absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1 py-1 pr-4"
                        onClick={handlePaste}
                    >
                        <img src={paste} alt="Paste" class="h-4 w-4" />
                        Paste
                    </button>
                </Show>
                <Show when={!!searchValue()}>
                    <button
                        class="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-m-grey-800 px-1 py-1"
                        onClick={() => setSearchValue("")}
                    >
                        <img src={close} alt="Clear" class="h-4 w-4" />
                    </button>
                </Show>
            </div>
            <Show when={showSendButton()}>
                <Button intent="green" onClick={handleContinue}>
                    Continue
                </Button>
            </Show>
            <div class="relative flex h-full max-h-[100svh] flex-col gap-3 overflow-y-scroll">
                <div class="sticky top-0 z-50 bg-m-grey-900/90 py-2 backdrop-blur-sm">
                    <h2 class="text-xl font-semibold">Contacts</h2>
                </div>
                <Show when={contacts.latest && contacts?.latest.length > 0}>
                    <For each={filteredContacts()}>
                        {(contact) => (
                            <button
                                onClick={() => sendToContact(contact)}
                                class="flex items-center gap-2"
                            >
                                <LabelCircle
                                    name={contact.name}
                                    image_url={contact.image_url}
                                    contact
                                    label={false}
                                    // Annoyingly the search input loses focus when the image load errors
                                    onError={() => searchInputRef.focus()}
                                />
                                <div class="flex flex-col items-start">
                                    <h2 class="overflow-hidden overflow-ellipsis text-base font-semibold">
                                        {contact.name}
                                    </h2>
                                    <h3 class="overflow-hidden overflow-ellipsis text-sm font-normal text-neutral-500">
                                        {contact.ln_address}
                                    </h3>
                                </div>
                            </button>
                        )}
                    </For>
                </Show>
                <ContactEditor createContact={createContact} />

                <Show when={!!searchValue()}>
                    <h2 class="py-2 text-xl font-semibold">Global Search</h2>
                    <Suspense fallback={<LoadingShimmer />}>
                        <GlobalSearch
                            searchValue={searchValue()}
                            sendToContact={sendToContact}
                            foundNpubs={foundNpubs()}
                        />
                    </Suspense>
                </Show>
                <div class="h-4" />
            </div>
        </>
    );
}

function GlobalSearch(props: {
    searchValue: string;
    sendToContact: (contact: TagItem) => void;
    foundNpubs: (string | undefined)[];
}) {
    const hexpubs = createMemo(() => {
        const hexpubs: string[] = [];
        for (const npub of props.foundNpubs) {
            hexpubFromNpub(npub)
                .then((h) => {
                    if (h) {
                        hexpubs.push(h);
                    }
                })
                .catch((e) => {
                    console.error(e);
                });
        }
        return hexpubs;
    });

    async function searchFetcher(args: { value?: string; hexpubs?: string[] }) {
        try {
            // Handling case when value starts with "npub"
            if (args.value?.startsWith("npub")) {
                const hexpub = await hexpubFromNpub(args.value);
                if (!hexpub) return [];

                const profile = await actuallyFetchNostrProfile(hexpub);
                if (!profile) return [];

                const contact = profileToPseudoContact(profile);
                return contact.ln_address ? [contact] : [];
            }

            // Handling case for other values (name, nip-05, whatever else primal searches)
            const contacts = await searchProfiles(args.value!.toLowerCase());
            return contacts.filter(
                (c) => c.ln_address && !args.hexpubs?.includes(c.hexpub)
            );
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    const searchArgs = createMemo(() => {
        if (props.searchValue) {
            return {
                value: props.searchValue,
                hexpubs: hexpubs()
            };
        } else {
            return {
                value: "",
                hexpubs: undefined
            };
        }
    });

    const [searchResults] = createResource(searchArgs, searchFetcher);

    return (
        <Switch>
            <Match
                when={
                    !!props.searchValue &&
                    searchResults.state === "ready" &&
                    searchResults()?.length === 0
                }
            >
                <p class="text-neutral-500">
                    No results found for "{props.searchValue}"
                </p>
            </Match>
            <Match when={true}>
                <For each={searchResults()}>
                    {(contact) => (
                        <SingleContact
                            contact={contact}
                            sendToContact={props.sendToContact}
                        />
                    )}
                </For>
            </Match>
        </Switch>
    );
}

function SingleContact(props: {
    contact: PseudoContact;
    sendToContact: (contact: TagItem) => void;
}) {
    const [state, _actions] = useMegaStore();
    async function createContactFromSearchResult(contact: PseudoContact) {
        try {
            const contactId = await state.mutiny_wallet?.create_new_contact(
                contact.name,
                contact.hexpub ? contact.hexpub : undefined,
                contact.ln_address ? contact.ln_address : undefined,
                undefined,
                contact.image_url ? contact.image_url : undefined
            );

            if (!contactId) {
                throw new Error("no contact id returned");
            }

            const tagItem = await state.mutiny_wallet?.get_tag_item(contactId);

            if (!tagItem) {
                throw new Error("no contact returned");
            }

            props.sendToContact(tagItem);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <button
            onClick={() => createContactFromSearchResult(props.contact)}
            class="flex items-center gap-2"
        >
            <LabelCircle
                name={props.contact.name}
                image_url={props.contact.image_url}
                contact
                label={false}
            />
            <div class="flex flex-col items-start">
                <h2 class="overflow-hidden overflow-ellipsis text-base font-semibold">
                    {props.contact.name}
                </h2>
                <h3 class="overflow-hidden overflow-ellipsis text-sm font-normal text-neutral-500">
                    {props.contact.ln_address}
                </h3>
            </div>
        </button>
    );
}
