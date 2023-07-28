import { Match, Switch, createSignal } from "solid-js";
import { SmallHeader, TinyButton } from "~/components/layout";
import { Dialog } from "@kobalte/core";
import close from "~/assets/icons/close.svg";
import { SubmitHandler } from "@modular-forms/solid";
import { ContactForm } from "./ContactForm";
import { ContactFormValues } from "./ContactViewer";
import { DIALOG_CONTENT, DIALOG_POSITIONER } from "~/styles/dialogs";
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
        <Dialog.Root open={isOpen()}>
            <Switch>
                <Match when={props.list}>
                    <button
                        onClick={() => setIsOpen(true)}
                        class="flex flex-col items-center gap-2"
                    >
                        <div class="bg-neutral-500 flex-none h-16 w-16 rounded-full flex items-center justify-center text-4xl uppercase ">
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
                        <div class="w-full flex justify-end">
                            <button
                                tabindex="-1"
                                onClick={() => setIsOpen(false)}
                                class="hover:bg-white/10 rounded-lg active:bg-m-blue"
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
