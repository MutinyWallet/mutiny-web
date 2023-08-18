import { Dialog } from "@kobalte/core";
import { SubmitHandler } from "@modular-forms/solid";
import { createSignal, Match, Switch } from "solid-js";

import close from "~/assets/icons/close.svg";
import {
    ContactForm,
    ContactFormValues,
    SmallHeader,
    TinyButton
} from "~/components";
import { useI18n } from "~/i18n/context";
import { DIALOG_CONTENT, DIALOG_POSITIONER } from "~/styles/dialogs";

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
        <Dialog.Root open={isOpen()}>
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
                    <TinyButton onClick={() => setIsOpen(true)}>
                        + {i18n.t("contacts.add_contact")}
                    </TinyButton>
                </Match>
            </Switch>
            <Dialog.Portal>
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content
                        class={DIALOG_CONTENT}
                        onEscapeKeyDown={() => setIsOpen(false)}
                    >
                        <div class="flex w-full justify-end">
                            <button
                                tabindex="-1"
                                onClick={() => setIsOpen(false)}
                                class="rounded-lg hover:bg-white/10 active:bg-m-blue"
                            >
                                <img src={close} alt="Close" />
                            </button>
                        </div>
                        <ContactForm
                            title={i18n.t("contacts.new_contact")}
                            cta={i18n.t("contacts.create_contact")}
                            handleSubmit={handleSubmit}
                        />
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
