import { For, Show, createEffect, createMemo, createSignal } from 'solid-js';
import { Button, LargeHeader, VStack } from '~/components/layout';
import { useMegaStore } from '~/state/megaStore';
import { satsToUsd } from '~/utils/conversions';
import { Amount } from './Amount';
import { Dialog, RadioGroup } from '@kobalte/core';
import close from "~/assets/icons/close.svg";
import { SubmitHandler, createForm, required, reset, setValue } from '@modular-forms/solid';
import { TextField } from './layout/TextField';
import { ColorRadioGroup } from './ColorRadioGroup';

type Color = "blue" | "green" | "red" | "gray"

type Contact = {
    name: string;
    npub?: string;
    isExchange: boolean;
    color: string;
}

// const colorOptions = ["blue", "green", "red", "gray"]

const colorOptions = [{ label: "blue", value: "blue" }, { label: "green", value: "green" }, { label: "red", value: "red" }, { label: "gray", value: "gray" }]

const INITIAL: Contact = { name: "", isExchange: false, color: "gray" }

export function ContactEditor(props: { createContact: (name: string) => void }) {
    const [isOpen, setIsOpen] = createSignal(true);

    const [contactForm, { Form, Field }] = createForm<Contact>({ initialValues: INITIAL });

    // What we're all here for in the first place: returning a value
    const handleSubmit: SubmitHandler<Contact> = (c: Contact) => {
        // e.preventDefault()

        props.createContact(c.name)

        setIsOpen(false);
    }

    createEffect(() => {
        // When isOpen changes we reset the form
        if (isOpen()) {
            reset(contactForm, { initialValues: INITIAL })
        }
    })

    const DIALOG_POSITIONER = "fixed inset-0 safe-top safe-bottom z-50"
    const DIALOG_CONTENT = "h-full safe-bottom flex flex-col justify-between p-4 backdrop-blur-xl bg-neutral-800/70"

    return (
        <Dialog.Root isOpen={isOpen()}>
            <button onClick={() => setIsOpen(true)} class="border border-l-white/50 border-r-white/50 border-t-white/75 border-b-white/25 bg-black px-1 py-[0.5] rounded cursor-pointer hover:outline-white hover:outline-1">+ Add Contact</button>
            <Dialog.Portal>
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT} onEscapeKeyDown={() => setIsOpen(false)}>
                        <div class="w-full flex justify-end">
                            <button tabindex="-1" onClick={() => setIsOpen(false)} class="hover:bg-white/10 rounded-lg active:bg-m-blue">
                                <img src={close} alt="Close" />
                            </button>
                        </div>
                        <Form onSubmit={handleSubmit} class="flex flex-col flex-1 justify-around gap-4 max-w-[400px] mx-auto w-full">
                            <div>

                                <LargeHeader>Create Contact</LargeHeader>
                                <VStack>
                                    <Field name="name" validate={[required("We at least need a name")]}>
                                        {(field, props) => (
                                            <TextField  {...props} placeholder='Satoshi' value={field.value} error={field.error} label="Name" />
                                        )}
                                    </Field>
                                    <Field name="npub" validate={[]}>
                                        {(field, props) => (
                                            <TextField  {...props} placeholder='npub...' value={field.value} error={field.error} label="Nostr npub or NIP-05 (optional)" />
                                        )}
                                    </Field>
                                    <Field name="color">
                                        {(field, props) => (
                                            <ColorRadioGroup options={colorOptions} {...props} value={field.value} error={field.error} label="Color" />
                                        )}
                                    </Field>
                                </VStack>
                            </div>
                            <Button type="submit" intent="blue" class="w-full flex-none">
                                Create Contact
                            </Button>
                        </Form>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root >
    );
}
