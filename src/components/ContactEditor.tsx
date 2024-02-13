import { SubmitHandler } from "@modular-forms/solid";
import { A } from "@solidjs/router";
import { createSignal, Match, Switch } from "solid-js";

import {
    ContactForm,
    ContactFormValues,
    SimpleDialog,
    SmallHeader
} from "~/components";
import { useI18n } from "~/i18n/context";

export function ContactEditor(props: {
    createContact: (contact: ContactFormValues) => void;
    list?: boolean;
}) {
    const i18n = useI18n();
    const [isOpen, setIsOpen] = createSignal(false);

    // What we're all here for in the first place: returning a value
    const handleSubmit: SubmitHandler<ContactFormValues> = (
        c: ContactFormValues
    ) => {
        props.createContact(c);
        setIsOpen(false);
    };

    return (
        <>
            <Switch>
                <Match when={props.list}>
                    <button
                        onClick={() => setIsOpen(true)}
                        class="flex flex-col items-center gap-2"
                    >
                        <div class="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-neutral-500 text-4xl uppercase ">
                            <span class="leading-[4rem]">+</span>
                        </div>
                        <SmallHeader class="overflow-ellipsis">
                            {i18n.t("contacts.new")}
                        </SmallHeader>
                    </button>
                </Match>
                <Match when={!props.list}>
                    <button
                        onClick={() => setIsOpen(true)}
                        class="flex w-full items-center gap-2 rounded-lg bg-neutral-700 p-2"
                    >
                        <h2 class="overflow-hidden overflow-ellipsis text-base font-semibold">
                            + {i18n.t("contacts.add_contact")}
                        </h2>
                    </button>
                </Match>
            </Switch>
            <SimpleDialog
                open={isOpen()}
                setOpen={setIsOpen}
                title={i18n.t("contacts.new_contact")}
            >
                <ContactForm
                    cta={i18n.t("contacts.create_contact")}
                    handleSubmit={handleSubmit}
                />
                <A
                    href="/settings/syncnostrcontacts"
                    class="self-center font-semibold text-m-red no-underline active:text-m-red/80"
                    state={{
                        previous: location.pathname
                    }}
                >
                    {i18n.t("contacts.link_to_nostr_sync")}
                </A>
            </SimpleDialog>
        </>
    );
}
