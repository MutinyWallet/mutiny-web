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
import { useI18n } from "~/i18n/context";

export default function LnUrlAuth() {
    const i18n = useI18n();
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
                    <BackLink
                        href="/settings"
                        title={i18n.t("settings.header")}
                    />
                    <LargeHeader>
                        {i18n.t("settings.lnurl_auth.title")}
                    </LargeHeader>
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
                                    {i18n.t("settings.lnurl_auth.title")}
                                </TextField.Label>
                                <TextField.Input
                                    class="w-full p-2 rounded-lg text-black"
                                    placeholder="LNURL..."
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
