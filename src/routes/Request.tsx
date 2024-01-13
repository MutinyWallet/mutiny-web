import { useNavigate, useParams } from "@solidjs/router";
import { createResource, createSignal, Suspense } from "solid-js";

import {
    AmountEditable,
    BackPop,
    Button,
    DefaultMain,
    LabelCircle,
    LargeHeader,
    MutinyWalletGuard,
    NavBar,
    ReceiveWarnings,
    showToast,
    SimpleInput,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify } from "~/utils";

import { DestinationItem } from "./Send";

export function RequestRoute() {
    const [state, _actions] = useMegaStore();
    const navigate = useNavigate();
    const i18n = useI18n();

    const params = useParams();

    const [amount, setAmount] = createSignal<bigint>(0n);
    const [whatForInput, setWhatForInput] = createSignal("");

    const [loading, setLoading] = createSignal(false);

    async function handleSubmit() {
        setLoading(true);
        console.log("requesting", amount(), whatForInput());
        try {
            const npub = contact()?.npub;
            if (!npub) throw new Error("Contact doesn't have a npub");

            const tags = params.id ? [params.id] : [];

            if (whatForInput()) {
                tags.push(whatForInput().trim());
            }

            const raw = await state.mutiny_wallet?.create_bip21(amount(), tags);

            if (!raw || !raw.invoice)
                throw new Error("Invoice creation failed");

            await state.mutiny_wallet?.send_dm(npub, raw.invoice);

            navigate("/chat/" + params.id);
        } catch (e) {
            console.error(e);
            showToast(eify(e));
        }
        setLoading(false);
    }

    async function getContact(id: string) {
        console.log("fetching contact", id);
        try {
            const contact = state.mutiny_wallet?.get_tag_item(id);
            console.log("fetching contact", contact);
            // This shouldn't happen
            if (!contact) throw new Error("Contact not found");
            return contact;
        } catch (e) {
            console.error(e);
            showToast(eify(e));
        }
    }

    const [contact] = createResource(() => params.id, getContact);

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <BackPop default={"/"} />
                <LargeHeader>{i18n.t("request.request_bitcoin")}</LargeHeader>
                <Suspense>
                    <DestinationItem
                        title={contact()?.name || ""}
                        value={contact()?.ln_address}
                        icon={
                            <LabelCircle
                                name={contact()?.name || ""}
                                image_url={contact()?.image_url}
                                contact
                                label={false}
                            />
                        }
                    />
                </Suspense>
                <div class="flex-1" />
                <VStack>
                    <AmountEditable
                        initialAmountSats={amount() || "0"}
                        setAmountSats={setAmount}
                        onSubmit={handleSubmit}
                    />
                    <ReceiveWarnings amountSats={amount() || "0"} />
                </VStack>
                <div class="flex-1" />
                <VStack>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (amount() > BigInt(0)) {
                                await handleSubmit();
                            }
                        }}
                    >
                        <SimpleInput
                            type="text"
                            value={whatForInput()}
                            placeholder={i18n.t("receive.what_for")}
                            onInput={(e) =>
                                setWhatForInput(e.currentTarget.value)
                            }
                        />
                    </form>
                    <Button
                        disabled={!amount()}
                        intent="green"
                        onClick={handleSubmit}
                        loading={loading()}
                    >
                        {i18n.t("request.request")}
                    </Button>
                </VStack>
            </DefaultMain>
            <NavBar activeTab="receive" />
        </MutinyWalletGuard>
    );
}
