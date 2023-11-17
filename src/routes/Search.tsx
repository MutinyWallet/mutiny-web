import { Clipboard } from "@capacitor/clipboard";
import { Capacitor } from "@capacitor/core";
import { TagItem } from "@mutinywallet/mutiny-wasm";
import { A, useNavigate } from "@solidjs/router";
import {
    createMemo,
    createResource,
    createSignal,
    For,
    onMount,
    Show,
    Suspense
} from "solid-js";

import close from "~/assets/icons/close.svg";
import paste from "~/assets/icons/paste.svg";
import scan from "~/assets/icons/scan.svg";
import {
    ContactEditor,
    ContactFormValues,
    LabelCircle,
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
            console.log("getting contacts");
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
        return (
            contacts()?.filter((c) => {
                const s = searchValue().toLowerCase();
                return (
                    //
                    c.ln_address &&
                    (c.name.toLowerCase().includes(s) ||
                        c.ln_address?.toLowerCase().includes(s) ||
                        c.npub?.includes(s))
                );
            }) || []
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
                (error) => {
                    // showToast(error);
                    console.log("error", error);
                },
                (result) => {
                    console.log("result", result);
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
            <div class="flex h-full flex-col gap-3 overflow-y-scroll">
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
                <div class="h-4" />
            </div>
        </>
    );
}
