import { TextField } from "@kobalte/core";
import { createSignal } from "solid-js";

import {
    BackLink,
    Button,
    DefaultMain,
    InnerCard,
    LargeHeader,
    MutinyWalletGuard,
    NavBar,
    SafeArea
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function WalletAuth() {
    const i18n = useI18n();
    const [state, _] = useMegaStore();

    const [value, setValue] = createSignal("");

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        const uri = value().trim();
        await state.mutiny_wallet?.approve_nostr_wallet_auth("👻", uri);

        setValue("");
    };

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink
                        href="/settings"
                        title={i18n.t("settings.header")}
                    />
                    <LargeHeader>
                        Nostr Wallet Auth
                    </LargeHeader>
                    <InnerCard>
                        <form class="flex flex-col gap-4" onSubmit={onSubmit}>
                            <TextField.Root
                                value={value()}
                                onChange={setValue}
                                validationState={
                                    value() == "" ||
                                    value().toLowerCase().startsWith("nostr+walletauth://")
                                        ? "valid"
                                        : "invalid"
                                }
                                class="flex flex-col gap-4"
                            >
                                <TextField.Label class="text-sm font-semibold uppercase">
                                    NWA
                                </TextField.Label>
                                <TextField.Input
                                    class="w-full rounded-lg p-2 text-black"
                                    placeholder="nostr+walletauth://41fa..."
                                />
                                <TextField.ErrorMessage class="text-red-500">
                                    {i18n.t("settings.lnurl_auth.expected")}
                                </TextField.ErrorMessage>
                            </TextField.Root>
                            <Button layout="small" type="submit">
                                {i18n.t("settings.lnurl_auth.auth")}
                            </Button>
                        </form>
                    </InnerCard>
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
