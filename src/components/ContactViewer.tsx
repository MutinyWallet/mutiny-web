import { Match, Switch, createSignal } from "solid-js";
import { Button, Card, NiceP, SmallHeader } from "~/components/layout";
import { Dialog } from "@kobalte/core";
import close from "~/assets/icons/close.svg";
import { SubmitHandler } from "@modular-forms/solid";
import { ContactForm } from "./ContactForm";
import { showToast } from "./Toaster";
import { Contact } from "@mutinywallet/mutiny-wasm";
import { DIALOG_CONTENT, DIALOG_POSITIONER } from "~/styles/dialogs";
import { useI18n } from "~/i18n/context";

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
                class="flex flex-col items-center gap-2 w-16 flex-shrink-0 overflow-x-hidden"
            >
                <div
                    class="flex-none h-16 w-16 rounded-full flex items-center justify-center text-4xl uppercase border-t border-b border-t-white/50 border-b-white/10"
                    style={{ background: props.gradient }}
                >
                    {props.contact.name[0]}
                </div>
                <SmallHeader class="overflow-ellipsis w-16 text-center overflow-hidden h-4">
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
                        <div class="w-full flex justify-end">
                            <button
                                tabindex="-1"
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsEditing(false);
                                }}
                                class="hover:bg-white/10 rounded-lg active:bg-m-blue"
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
                                <div class="flex flex-col flex-1 justify-around items-center gap-4 max-w-[400px] mx-auto w-full">
                                    <div class="flex flex-col items-center w-full">
                                        <div
                                            class="flex-none h-32 w-32 rounded-full flex items-center justify-center text-8xl uppercase border-t border-b border-t-white/50 border-b-white/10"
                                            style={{
                                                background: props.gradient
                                            }}
                                        >
                                            {props.contact.name[0]}
                                        </div>
                                        <h1 class="text-2xl font-semibold uppercase mt-2 mb-4">
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
