import { Dialog } from "@kobalte/core";
import { SubmitHandler } from "@modular-forms/solid";
import { Contact } from "@mutinywallet/mutiny-wasm";
import { createSignal, Match, Show, Switch } from "solid-js";
import { useNavigate } from "solid-start";

import close from "~/assets/icons/close.svg";
import {
    Button,
    ContactForm,
    KeyValue,
    MiniStringShower,
    showToast,
    SmallHeader,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { toParsedParams } from "~/logic/waila";
import { useMegaStore } from "~/state/megaStore";
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
    const [state, actions] = useMegaStore();
    const navigate = useNavigate();

    const handleSubmit: SubmitHandler<ContactFormValues> = (
        c: ContactFormValues
    ) => {
        // FIXME: merge with existing contact if saving (need edit contact method)
        // FIXME: npub not valid? other undefineds
        const contact = new Contact(c.name, undefined, undefined, undefined);
        props.saveContact(contact);
        setIsEditing(false);
    };

    const handlePay = () => {
        const network = state.mutiny_wallet?.get_network() || "signet";

        const lnurl = props.contact.lnurl || props.contact.ln_address || "";

        if (lnurl) {
            const result = toParsedParams(lnurl, network);
            if (!result.ok) {
                showToast(result.error);
                return;
            } else {
                result.value.privateTag = props.contact.name;
                if (
                    result.value?.address ||
                    result.value?.invoice ||
                    result.value?.node_pubkey ||
                    result.value?.lnurl
                ) {
                    actions.setScanResult(result.value);
                    navigate("/send");
                }
            }
        }
    };

    return (
        <Dialog.Root open={isOpen()}>
            <button
                onClick={() => setIsOpen(true)}
                class="flex w-16 flex-shrink-0 flex-col items-center gap-2 overflow-x-hidden"
            >
                <div
                    class="flex h-16 w-16 flex-none items-center justify-center overflow-clip rounded-full border-b border-t border-b-white/10 border-t-white/50 text-4xl uppercase"
                    style={{ background: props.gradient }}
                >
                    <Switch>
                        <Match when={props.contact.image_url}>
                            <img src={props.contact.image_url} />
                        </Match>
                        <Match when={true}>{props.contact.name[0]}</Match>
                    </Switch>
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
                                            class="flex h-32 w-32 flex-none items-center justify-center overflow-clip rounded-full border-b border-t border-b-white/10 border-t-white/50 text-8xl uppercase"
                                            style={{
                                                background: props.gradient
                                            }}
                                        >
                                            <Switch>
                                                <Match
                                                    when={
                                                        props.contact.image_url
                                                    }
                                                >
                                                    <img
                                                        src={
                                                            props.contact
                                                                .image_url
                                                        }
                                                    />
                                                </Match>
                                                <Match when={true}>
                                                    {props.contact.name[0]}
                                                </Match>
                                            </Switch>
                                        </div>

                                        <h1 class="mb-4 mt-2 text-2xl font-semibold uppercase">
                                            {props.contact.name}
                                        </h1>

                                        <div class="flex flex-1 flex-col justify-center">
                                            <VStack>
                                                <Show when={props.contact.npub}>
                                                    <KeyValue key={"Npub"}>
                                                        <MiniStringShower
                                                            text={
                                                                props.contact
                                                                    .npub!
                                                            }
                                                        />
                                                    </KeyValue>
                                                </Show>
                                                <Show
                                                    when={
                                                        props.contact.ln_address
                                                    }
                                                >
                                                    <KeyValue
                                                        key={i18n.t(
                                                            "contacts.lightning_address"
                                                        )}
                                                    >
                                                        <MiniStringShower
                                                            text={
                                                                props.contact
                                                                    .ln_address!
                                                            }
                                                        />
                                                    </KeyValue>
                                                </Show>
                                            </VStack>
                                        </div>
                                        {/* TODO: show payment history for a contact */}
                                        {/* <Card
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
                                        </Card> */}
                                    </div>

                                    {/* TODO: implement contact editing */}
                                    {/* <div class="flex w-full gap-2">
                                        <Button
                                            layout="flex"
                                            intent="green"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            {i18n.t("contacts.edit")}
                                        </Button>

                                    </div> */}

                                    <div class="flex w-full">
                                        <Button
                                            intent="blue"
                                            disabled={
                                                !props.contact.lnurl &&
                                                !props.contact.ln_address
                                            }
                                            onClick={handlePay}
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
