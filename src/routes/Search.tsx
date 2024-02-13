import { Clipboard } from "@capacitor/clipboard";
import { Capacitor } from "@capacitor/core";
import { TagItem } from "@mutinywallet/mutiny-wasm";
import { A, useNavigate } from "@solidjs/router";
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
    debounce,
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

    function handleContinue() {
        actions.handleIncomingString(
            debouncedSearchValue().trim(),
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
                    placeholder={i18n.t("send.search.placeholder")}
                    autofocus
                    ref={(el) => (searchInputRef = el)}
                />
                <Show when={!searchValue()}>
                    <button
                        class="bg-m-grey- absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1 py-1 pr-4"
                        onClick={handlePaste}
                    >
                        <img src={paste} alt="Paste" class="h-4 w-4" />
                        {i18n.t("send.search.paste")}
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
            <Show when={searchState() !== "notsendable"}>
                <Button intent="green" onClick={handleContinue}>
                    {i18n.t("common.continue")}
                </Button>
            </Show>
            <Show when={searchState() !== "sendable"}>
                <div class="relative flex h-full max-h-[100svh] flex-col gap-3 overflow-y-scroll">
                    <Suspense>
                        <div class="sticky top-0 z-50 bg-m-grey-900/90 py-2 backdrop-blur-sm">
                            <h2 class="text-xl font-semibold">
                                {i18n.t("send.search.contacts")}
                            </h2>
                        </div>
                        <Show
                            when={
                                contacts.latest && contacts?.latest.length > 0
                            }
                        >
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
                                {i18n.t("send.search.global_search")}
                            </h2>
                            <GlobalSearch
                                searchValue={debouncedSearchValue()}
                                sendToContact={sendToContact}
                                foundNpubs={foundNpubs()}
                            />
                        </Show>
                    </Suspense>
                    <div class="h-4" />
                </div>
            </Show>
        </>
    );
}

function GlobalSearch(props: {
    searchValue: string;
    sendToContact: (contact: TagItem) => void;
    foundNpubs: (string | undefined)[];
}) {
    const i18n = useI18n();
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
                    {i18n.t("send.search.no_results") + " " + props.searchValue}
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

function ContactButton(props: {
    contact: PseudoContact | TagItem;
    onClick: () => void;
}) {
    const i18n = useI18n();

    const primalUrl = createMemo(() => {
        const originalUrl = props.contact.image_url;
        if (!originalUrl) return undefined;

        return `https://primal.b-cdn.net/media-cache?s=s&a=1&u=${encodeURIComponent(
            originalUrl
        )}`;
    });

    return (
        <button
            onClick={() => props.onClick()}
            class={
                props.contact.ln_address || props.contact.lnurl
                    ? "flex items-center gap-2"
                    : "flex items-center gap-2 text-white/20 opacity-60"
            }
            disabled={
                props.contact.ln_address === undefined &&
                props.contact.lnurl === undefined
            }
        >
            <LabelCircle
                name={props.contact.name}
                image_url={primalUrl()}
                contact
                label={false}
            />
            <div class="flex flex-col items-start">
                <h2 class="overflow-hidden overflow-ellipsis text-base font-semibold">
                    {props.contact.name}
                </h2>
                <h3
                    class={
                        props.contact.ln_address || props.contact.lnurl
                            ? "overflow-hidden overflow-ellipsis text-sm font-normal text-neutral-500"
                            : "overflow-hidden overflow-ellipsis text-sm font-normal"
                    }
                >
                    {props.contact.ln_address ||
                        props.contact.lnurl
                            ?.toLowerCase()
                            .substring(0, 15)
                            .concat("...") ||
                        i18n.t("send.no_payment_info")}
                </h3>
            </div>
        </button>
    );
}
