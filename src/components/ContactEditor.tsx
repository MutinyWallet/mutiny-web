import { Match, Switch, createSignal, createUniqueId } from 'solid-js';
import { SmallHeader } from '~/components/layout';
import { Dialog } from '@kobalte/core';
import close from "~/assets/icons/close.svg";
import { SubmitHandler } from '@modular-forms/solid';
import { ContactItem } from '~/state/contacts';
import { ContactForm } from './ContactForm';

const INITIAL: ContactItem = { id: createUniqueId(), kind: "contact", name: "", color: "gray" }

export function ContactEditor(props: { createContact: (contact: ContactItem) => void, list?: boolean }) {
    const [isOpen, setIsOpen] = createSignal(false);

    // What we're all here for in the first place: returning a value
    const handleSubmit: SubmitHandler<ContactItem> = (c: ContactItem) => {
        // TODO: why do the id and color disappear?

        const odd = { id: createUniqueId(), kind: "contact" }

        props.createContact({ ...odd, ...c })

        setIsOpen(false);
    }

    const DIALOG_POSITIONER = "fixed inset-0 safe-top safe-bottom z-50"
    const DIALOG_CONTENT = "h-full safe-bottom flex flex-col justify-between p-4 backdrop-blur-xl bg-neutral-800/70"

    return (
        <Dialog.Root isOpen={isOpen()}>
            <Switch>
                <Match when={props.list}>
                    <button onClick={() => setIsOpen(true)} class="flex flex-col items-center gap-2">
                        <div class="bg-neutral-500 flex-none h-16 w-16 rounded-full flex items-center justify-center text-4xl uppercase ">
                            <span class="leading-[4rem]">+</span>
                        </div>
                        <SmallHeader class="overflow-ellipsis">
                            new
                        </SmallHeader>
                    </button>
                </Match>
                <Match when={!props.list}>
                    <button onClick={() => setIsOpen(true)} class="border border-l-white/50 border-r-white/50 border-t-white/75 border-b-white/25 bg-black px-1 py-[0.5] rounded cursor-pointer hover:outline-white hover:outline-1">+ Add Contact</button>
                </Match>
            </Switch>
            <Dialog.Portal>
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT} onEscapeKeyDown={() => setIsOpen(false)}>
                        <div class="w-full flex justify-end">
                            <button tabindex="-1" onClick={() => setIsOpen(false)} class="hover:bg-white/10 rounded-lg active:bg-m-blue">
                                <img src={close} alt="Close" />
                            </button>
                        </div>
                        <ContactForm title="New contact" cta="Create contact" handleSubmit={handleSubmit} initialValues={INITIAL} />
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root >
    );
}
