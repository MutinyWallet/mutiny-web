import { Dialog } from "@kobalte/core";
import { SubmitHandler } from "@modular-forms/solid";
import { Contact } from "@johncantrell97/mutiny-wasm";
import { createSignal, Match, Switch } from "solid-js";

import close from "~/assets/icons/close.svg";
import {
    Button,
    Card,
    ContactForm,
    NiceP,
    showToast,
    SmallHeader
} from "~/components";
import { useI18n } from "~/i18n/context";
import { DIALOG_CONTENT, DIALOG_POSITIONER } from "~/styles/dialogs";

export type ContactFormValues = {
    name: string;
    npub?: string;
};

export function ContactViewer(props: {
    contact: Contact;
    gradient: string;
    saveContact: (contact: Contact) => void;
}) {
    const i18n = useI18n();
    const [isOpen, setIsOpen] = createSignal(false);
    const [isEditing, setIsEditing] = createSignal(false);

    const handleSubmit: SubmitHandler<ContactFormValues> = (
        c: ContactFormValues
    ) => {
        // FIXME: merge with existing contact if saving (need edit contact method)
        // FIXME: npub not valid? other undefineds
        const contact = new Contact(c.name, undefined, undefined, undefined);
        props.saveContact(contact);
        setIsEditing(false);
    };

    return (
        <Dialog.Root open={isOpen()}>
            <button
                onClick={() => setIsOpen(true)}
                class="flex w-16 flex-shrink-0 flex-col items-center gap-2 overflow-x-hidden"
            >
                <div
                    class="flex h-16 w-16 flex-none items-center justify-center rounded-full border-b border-t border-b-white/10 border-t-white/50 text-4xl uppercase"
                    style={{ background: props.gradient }}
                >
                    {props.contact.name[0]}
                </div>
                <SmallHeader class="h-4 w-16 overflow-hidden overflow-ellipsis text-center">
                    {props.contact.name}
                </SmallHeader>
            </button>
            <Dialog.Portal>
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content
                        class={DIALOG_CONTENT}
                        onEscapeKeyDown={() => {
                            setIsOpen(false);
                            setIsEditing(false);
                        }}
                    >
                        <div class="flex w-full justify-end">
                            <button
                                tabindex="-1"
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsEditing(false);
                                }}
                                class="rounded-lg hover:bg-white/10 active:bg-m-blue"
                            >
                                <img src={close} alt="Close" />
                            </button>
                        </div>
                        <Switch>
                            <Match when={isEditing()}>
                                <ContactForm
                                    title={i18n.t("contacts.edit_contact")}
                                    cta={i18n.t("contacts.save_contact")}
                                    handleSubmit={handleSubmit}
                                    initialValues={props.contact}
                                />
                            </Match>
                            <Match when={!isEditing()}>
                                <div class="mx-auto flex w-full max-w-[400px] flex-1 flex-col items-center justify-around gap-4">
                                    <div class="flex w-full flex-col items-center">
                                        <div
                                            class="flex h-32 w-32 flex-none items-center justify-center rounded-full border-b border-t border-b-white/10 border-t-white/50 text-8xl uppercase"
                                            style={{
                                                background: props.gradient
                                            }}
                                        >
                                            {props.contact.name[0]}
                                        </div>
                                        <h1 class="mb-4 mt-2 text-2xl font-semibold uppercase">
                                            {props.contact.name}
                                        </h1>
                                        <Card
                                            title={i18n.t(
                                                "contacts.payment_history"
                                            )}
                                        >
                                            <NiceP>
                                                {i18n.t("contacts.no_payments")}{" "}
                                                <span class="font-semibold">
                                                    {props.contact.name}
                                                </span>
                                            </NiceP>
                                        </Card>
                                    </div>

                                    <div class="flex w-full gap-2">
                                        <Button
                                            layout="flex"
                                            intent="green"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            {i18n.t("contacts.edit")}
                                        </Button>
                                        <Button
                                            intent="blue"
                                            onClick={() => {
                                                showToast({
                                                    title: i18n.t(
                                                        "contacts.unimplemented"
                                                    ),
                                                    description: i18n.t(
                                                        "contacts.not_available"
                                                    )
                                                });
                                            }}
                                        >
                                            {i18n.t("contacts.pay")}
                                        </Button>
                                    </div>
                                </div>
                            </Match>
                        </Switch>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
