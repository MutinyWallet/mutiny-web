import { TextField } from "@kobalte/core";
import { createSignal } from "solid-js";
import NavBar from "~/components/NavBar";
import {
    Button,
    DefaultMain,
    InnerCard,
    LargeHeader,
    MutinyWalletGuard,
    SafeArea
} from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import { useMegaStore } from "~/state/megaStore";

export default function LnUrlAuth() {
    const [state, _] = useMegaStore();

    const [value, setValue] = createSignal("");

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        const lnurl = value().trim();
        await state.mutiny_wallet?.lnurl_auth(lnurl);

        setValue("");
    };

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink href="/settings" title="Settings" />
                    <LargeHeader>LNURL Auth</LargeHeader>
                    <InnerCard>
                        <form class="flex flex-col gap-4" onSubmit={onSubmit}>
                            <TextField.Root
                                value={value()}
                                onChange={setValue}
                                validationState={
                                    value() == "" ||
                                    value().toLowerCase().startsWith("lnurl")
                                        ? "valid"
                                        : "invalid"
                                }
                                class="flex flex-col gap-4"
                            >
                                <TextField.Label class="text-sm font-semibold uppercase">
                                    LNURL Auth
                                </TextField.Label>
                                <TextField.Input
                                    class="w-full p-2 rounded-lg text-black"
                                    placeholder="LNURL..."
                                />
                                <TextField.ErrorMessage class="text-red-500">
                                    Expecting something like LNURL...
                                </TextField.ErrorMessage>
                            </TextField.Root>
                            <Button layout="small" type="submit">
                                Auth
                            </Button>
                        </form>
                    </InnerCard>
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
