import { Clipboard } from "@capacitor/clipboard";
import { Capacitor } from "@capacitor/core";
import { TagItem } from "@mutinywallet/mutiny-wasm";
import {
    A,
    cache,
    createAsync,
    useNavigate,
    useSearchParams
} from "@solidjs/router";
import { LucideClipboard, Scan, X } from "lucide-solid";
import {
    createEffect,
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

import {
    ContactButton,
    ContactEditor,
    ContactFormValues,
    LoadingShimmer,
    NavBar,
    showToast,
    VStack
} from "~/components";
import {
    BackLink,
    Button,
    DefaultMain,
    MutinyWalletGuard
} from "~/components/layout";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import {
    actuallyFetchNostrProfile,
    debounce,
    hexpubFromNpub,
    profileToPseudoContact,
    PseudoContact,
    searchProfiles
} from "~/utils";

export function Search() {
    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <div class="flex items-center justify-between">
                    <BackLink />
                    <A
                        class="rounded-lg p-2 hover:bg-white/5 active:bg-m-blue md:hidden"
                        href="/scanner"
                    >
                        <Scan class="h-6 w-6" />
                    </A>{" "}
                </div>
                {/* Need to put the search view in a supsense so it loads list on first nav */}
                <Suspense>
                    <ActualSearch />
                </Suspense>
            </DefaultMain>
            <NavBar activeTab="send" />
        </MutinyWalletGuard>
    );
}

function ActualSearch(props: { initialValue?: string }) {
    const [searchValue, setSearchValue] = createSignal("");
    const [debouncedSearchValue, setDebouncedSearchValue] = createSignal("");
    const [state, actions] = useMegaStore();
    const navigate = useNavigate();
    const i18n = useI18n();

    const trigger = debounce((message: string) => {
        setDebouncedSearchValue(message);
    }, 250);

    createEffect(() => {
        trigger(searchValue());
    });

    const getContacts = cache(async () => {
        try {
            const contacts = await state.mutiny_wallet?.get_contacts_sorted();
            return contacts || ([] as TagItem[]);
        } catch (e) {
            console.error(e);
            return [] as TagItem[];
        }
    }, "contacts");

    const contacts = createAsync<TagItem[]>(() => getContacts(), {
        initialValue: []
    });

    const filteredContacts = createMemo(() => {
        const s = debouncedSearchValue().toLowerCase();
        return (
            contacts()?.filter((c) => {
                return (
                    c.name.toLowerCase().includes(s) ||
                    c.ln_address?.toLowerCase().includes(s) ||
                    c.lnurl?.toLowerCase().includes(s) ||
                    c.npub?.includes(s)
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

    type SearchState = "notsendable" | "sendable" | "sendableWithContact";

    const searchState = createMemo<SearchState>(() => {
        if (debouncedSearchValue() === "") {
            return "notsendable";
        }
        const text = debouncedSearchValue().trim();
        // Only want to check for something parseable if it's of reasonable length
        if (text.length < 6) {
            return "notsendable";
        }
        let state: SearchState = "notsendable";
        actions.handleIncomingString(
            text,
            (_error) => {
                // noop
            },
            (result) => {
                if (result.lightning_address || result.lnurl) {
                    state = "sendableWithContact";
                } else {
                    state = "sendable";
                }
            }
        );
        return state;
    });

    function navWithSearchValue(to: string) {
        navigate(to, {
            state: {
                previous: searchValue()
                    ? `/search/?search=${searchValue().trim()}`
                    : "/search"
            }
        });
    }

    function handleContinue() {
        actions.handleIncomingString(
            debouncedSearchValue().trim(),
            (error) => {
                showToast(error);
            },
            (result) => {
                if (result) {
                    actions.setScanResult(result);
                    navigate("/send", {
                        state: {
                            previous: "/search"
                        }
                    });
                } else {
                    showToast(new Error(i18n.t("send.error_address")));
                }
            }
        );
    }

    const profileDeleted = createMemo(
        () => state.mutiny_wallet?.get_nostr_profile().deleted
    );

    // TODO this is mostly copy pasted from chat, could be a shared util maybe
    function navToSend(contact?: TagItem) {
        if (!contact) return;
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
                    navigate("/send");
                }
            );
        } else {
            console.error("no ln_address or lnurl");
        }
    }

    function sendToContact(contact: TagItem) {
        if (profileDeleted()) {
            navToSend(contact);
        } else {
            navWithSearchValue(`/chat/${contact.id}`);
        }
    }

    async function createContact(contact: ContactFormValues) {
        try {
            // First check if the contact already exists
            const existingContact = contacts()?.find(
                (c) => c.npub === contact.npub?.trim().toLowerCase()
            );

            if (existingContact) {
                sendToContact(existingContact);
                return;
            }

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

            // if the new contact has an npub, send to chat
            // otherwise, send to send page
            if (tagItem.npub) {
                sendToContact(tagItem);
            } else if (tagItem.ln_address) {
                actions.handleIncomingString(
                    tagItem.ln_address,
                    () => {},
                    () => {
                        navigate("/send");
                    }
                );
            } else if (tagItem.lnurl) {
                actions.handleIncomingString(
                    tagItem.lnurl,
                    () => {},
                    () => {
                        navigate("/send");
                    }
                );
            } else {
                console.error(
                    "No npub, ln_address, or lnurl found, this should never happen"
                );
            }
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

    const [_params, setParams] = useSearchParams();

    onMount(() => {
        setSearchValue(props.initialValue || "");
        setParams({ search: "" });
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
                    autocomplete="off"
                    autocorrect="off"
                    ref={(el) => (searchInputRef = el)}
                />
                <Show when={!searchValue()}>
                    <button
                        class="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1 py-1 pr-4"
                        onClick={handlePaste}
                    >
                        <LucideClipboard class="h-4 w-4" />
                        Paste
                    </button>
                </Show>
                <Show when={!!searchValue()}>
                    <button
                        class="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-m-grey-800 px-1 py-1"
                        onClick={() => setSearchValue("")}
                    >
                        <X class="h-4 w-4" />
                    </button>
                </Show>
            </div>
            <div class="flex-0 flex w-full">
                <Show when={searchState() !== "notsendable"}>
                    <Button intent="green" onClick={handleContinue}>
                        Continue
                    </Button>
                </Show>
            </div>
            <Show when={searchState() !== "sendable"}>
                <VStack>
                    <Suspense>
                        <h2 class="text-xl font-semibold">Contacts</h2>
                        <Show when={contacts() && contacts().length > 0}>
                            <For each={filteredContacts()}>
                                {(contact) => (
                                    <ContactButton
                                        contact={contact}
                                        onClick={() => sendToContact(contact)}
                                    />
                                )}
                            </For>
                        </Show>
                    </Suspense>
                    <ContactEditor createContact={createContact} />

                    <Suspense fallback={<LoadingShimmer />}>
                        <Show when={!!debouncedSearchValue()}>
                            <h2 class="py-2 text-xl font-semibold">
                                Global Search
                            </h2>
                            <GlobalSearch
                                searchValue={debouncedSearchValue()}
                                sendToContact={sendToContact}
                                foundNpubs={foundNpubs()}
                            />
                        </Show>
                    </Suspense>
                    <div class="h-4" />
                </VStack>
            </Show>
        </>
    );
}

function GlobalSearch(props: {
    searchValue: string;
    sendToContact: (contact: TagItem) => void;
    foundNpubs: (string | undefined)[];
}) {
    const hexpubs = createMemo(() => {
        const hexpubs: Set<string> = new Set();
        for (const npub of props.foundNpubs) {
            hexpubFromNpub(npub)
                .then((h) => {
                    if (h) {
                        hexpubs.add(h);
                    }
                })
                .catch((e) => {
                    console.error(e);
                });
        }
        return hexpubs;
    });

    async function searchFetcher(args: {
        value?: string;
        hexpubs?: Set<string>;
    }) {
        try {
            // Handling case when value starts with "npub"
            if (args.value?.toLowerCase().startsWith("npub")) {
                const hexpub = await hexpubFromNpub(args.value);
                if (!hexpub) return [];

                const profile = await actuallyFetchNostrProfile(hexpub);
                if (!profile) return [];

                const contact = profileToPseudoContact(profile);
                return [contact];
            }

            // Handling case for other values (name, nip-05, whatever else primal searches)
            const contacts = await searchProfiles(args.value!.toLowerCase());
            return contacts.filter((c) => !args.hexpubs?.has(c.hexpub));
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
        <ContactButton
            contact={props.contact}
            onClick={() => createContactFromSearchResult(props.contact)}
        />
    );
}
