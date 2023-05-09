import { Match, Switch, createSignal } from 'solid-js';
import { Button, Card, NiceP, SmallHeader } from '~/components/layout';
import { Dialog } from '@kobalte/core';
import close from "~/assets/icons/close.svg";
import { SubmitHandler } from '@modular-forms/solid';
import { ContactItem } from '~/state/contacts';
import { ContactForm } from './ContactForm';
import { showToast } from './Toaster';

export function ContactViewer(props: { contact: ContactItem, gradient: string, saveContact: (contact: ContactItem) => void }) {
    const [isOpen, setIsOpen] = createSignal(false);
    const [isEditing, setIsEditing] = createSignal(false);

    const handleSubmit: SubmitHandler<ContactItem> = (c: ContactItem) => {
        props.saveContact({ ...props.contact, ...c })
        setIsEditing(false)
    }

    const DIALOG_POSITIONER = "fixed inset-0 safe-top safe-bottom z-50"
    const DIALOG_CONTENT = "h-full safe-bottom flex flex-col justify-between p-4 backdrop-blur-xl bg-neutral-800/70"

    return (
        <Dialog.Root isOpen={isOpen()}>
            <button onClick={() => setIsOpen(true)} class="flex flex-col items-center gap-2 w-16 flex-shrink-0 overflow-x-hidden">
                <div class="flex-none h-16 w-16 rounded-full flex items-center justify-center text-4xl uppercase border-t border-b border-t-white/50 border-b-white/10"
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
                    <Dialog.Content class={DIALOG_CONTENT} onEscapeKeyDown={() => setIsOpen(false)}>
                        <div class="w-full flex justify-end">
                            <button tabindex="-1" onClick={() => setIsOpen(false)} class="hover:bg-white/10 rounded-lg active:bg-m-blue">
                                <img src={close} alt="Close" />
                            </button>
                        </div>
                        <Switch>
                            <Match when={isEditing()}>
                                <ContactForm title="Edit contact" cta="Save contact" handleSubmit={handleSubmit} initialValues={props.contact} />
                            </Match>
                            <Match when={!isEditing()}>
                                <div class="flex flex-col flex-1 justify-around items-center gap-4 max-w-[400px] mx-auto w-full">
                                    <div class="flex flex-col items-center w-full">
                                        <div class="flex-none h-32 w-32 rounded-full flex items-center justify-center text-8xl uppercase border-t border-b border-t-white/50 border-b-white/10"
                                            style={{ background: props.gradient }}
                                        >
                                            {props.contact.name[0]}
                                        </div>
                                        <h1 class="text-2xl font-semibold uppercase mt-2 mb-4">{props.contact.name}</h1>
                                        <Card title="Payment history">
                                            <NiceP>No payments yet with <span class="font-semibold">{props.contact.name}</span></NiceP>
                                        </Card>
                                    </div>

                                    <div class="flex w-full gap-2">
                                        <Button layout="flex" intent="green" onClick={() => setIsEditing(true)}>Edit</Button>
                                        <Button intent="blue" onClick={() => { showToast({ title: "Unimplemented", description: "We don't do that yet" }) }}>Pay</Button>
                                    </div>
                                </div>
                            </Match>
                        </Switch>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root >
    );
}
