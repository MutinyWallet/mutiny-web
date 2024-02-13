import { SubmitHandler } from "@modular-forms/solid";
import { TagItem } from "@mutinywallet/mutiny-wasm";
import { useNavigate } from "@solidjs/router";
import { createSignal, Match, Show, Switch } from "solid-js";

import {
    Button,
    ConfirmDialog,
    ContactForm,
    KeyValue,
    MiniStringShower,
    showToast,
    SimpleDialog,
    SmallHeader,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { toParsedParams } from "~/logic/waila";
import { useMegaStore } from "~/state/megaStore";

export type ContactFormValues = {
    name: string;
    npub?: string;
    ln_address?: string;
};

export function ContactViewer(props: {
    contact: TagItem;
    gradient: string;
    saveContact: (id: string, contact: ContactFormValues) => void;
    deleteContact: (id: string) => Promise<void>;
}) {
    const i18n = useI18n();
    const [isOpen, setIsOpen] = createSignal(false);
    const [isEditing, setIsEditing] = createSignal(false);
    const [state, actions] = useMegaStore();
    const navigate = useNavigate();
    const [confirmOpen, setConfirmOpen] = createSignal(false);

    const handleSubmit: SubmitHandler<ContactFormValues> = (
        c: ContactFormValues
    ) => {
        const id = props.contact.id;

        props.saveContact(id, c);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        const id = props.contact.id;

        await props.deleteContact(id);
        setIsOpen(false);
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
        <>
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
            <SimpleDialog
                open={isOpen()}
                setOpen={setIsOpen}
                title={isEditing() ? i18n.t("contacts.edit_contact") : ""}
            >
                <Switch>
                    <Match when={isEditing()}>
                        <ContactForm
                            cta={i18n.t("contacts.save_contact")}
                            handleSubmit={handleSubmit}
                            initialValues={props.contact}
                        />
                        <Button
                            intent="red"
                            onClick={() => setConfirmOpen(true)}
                        >
                            {i18n.t("contacts.delete")}
                        </Button>
                        <ConfirmDialog
                            open={confirmOpen()}
                            loading={false}
                            onConfirm={handleDelete}
                            onCancel={() => setConfirmOpen(false)}
                        >
                            {i18n.t("contacts.confirm_delete")}
                        </ConfirmDialog>
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
                                        <Match when={props.contact.image_url}>
                                            <img
                                                src={props.contact.image_url}
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
                                                    text={props.contact.npub!}
                                                />
                                            </KeyValue>
                                        </Show>
                                        <Show when={props.contact.ln_address}>
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
            </SimpleDialog>
        </>
    );
}
