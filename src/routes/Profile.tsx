import { useNavigate } from "@solidjs/router";
import { Copy, Edit, Import, QrCode } from "lucide-solid";
import { createMemo, createSignal, Match, Show, Switch } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";

import {
    BackLink,
    BalanceBox,
    ButtonCard,
    DefaultMain,
    FancyCard,
    LabelCircle,
    MutinyWalletGuard,
    NavBar,
    NiceP,
    SimpleDialog
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { useCopy } from "~/utils";

export function Profile() {
    const [state, _actions] = useMegaStore();
    const i18n = useI18n();

    const navigate = useNavigate();

    const profile = createMemo(() => {
        const profile = state.mutiny_wallet?.get_nostr_profile();

        console.log("profile", profile);

        return {
            name: profile?.display_name || profile?.name || "Anon",
            picture: profile?.picture || undefined,
            lud16: profile?.lud16 || undefined,
            deleted: profile?.deleted || false
        };
    });

    const [showQr, setShowQr] = createSignal(false);

    const [copy, copied] = useCopy({ copiedTimeout: 1000 });

    const profileDeleted = createMemo(() => {
        return profile().deleted === true || profile().deleted === "true";
    });

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <BackLink />
                <Show when={profile() && !profileDeleted()}>
                    <div class="flex flex-col items-center gap-4">
                        <LabelCircle
                            contact
                            label={false}
                            image_url={profile().picture}
                            size="xl"
                        />
                        <h1 class="text-3xl font-semibold">
                            <Show when={profile().name}>{profile().name}</Show>
                        </h1>

                        <FancyCard>
                            <Switch>
                                <Match when={profile().lud16}>
                                    <p class="break-all text-center font-system-mono text-base ">
                                        {profile().lud16}
                                    </p>
                                    <div class="flex w-full justify-center gap-8">
                                        <button onClick={() => setShowQr(true)}>
                                            <QrCode class="inline-block" />
                                        </button>
                                        <button
                                            class="p-1"
                                            classList={{
                                                "bg-m-red rounded": copied()
                                            }}
                                            onClick={() =>
                                                copy(profile().lud16)
                                            }
                                        >
                                            <Copy class="inline-block" />
                                        </button>
                                    </div>{" "}
                                    <SimpleDialog
                                        open={showQr()}
                                        setOpen={(open) => {
                                            setShowQr(open);
                                        }}
                                        title={"Lightning Address"}
                                    >
                                        <div class="w-[10rem] self-center rounded bg-white p-[1rem]">
                                            <QRCodeSVG
                                                value={
                                                    "lightning:" +
                                                        profile().lud16 || ""
                                                }
                                                class="h-full max-h-[256px] w-full"
                                            />
                                        </div>
                                    </SimpleDialog>
                                </Match>
                                <Match when={true}>
                                    <p class="text-center text-base italic text-m-grey-350">
                                        No Lightning Address set
                                    </p>
                                </Match>
                            </Switch>
                        </FancyCard>
                    </div>
                    <ButtonCard onClick={() => navigate("/editprofile")}>
                        <div class="flex items-center gap-2">
                            {/* <Users class="inline-block text-m-red" /> */}
                            <Edit class="inline-block text-m-red" />
                            <NiceP>{i18n.t("profile.edit_profile")}</NiceP>
                        </div>
                    </ButtonCard>
                </Show>
                <Show when={profile() && profile().deleted}>
                    <ButtonCard
                        onClick={() => navigate("/settings/importprofile")}
                    >
                        <div class="flex items-center gap-2">
                            <Import class="inline-block text-m-red" />
                            <NiceP>
                                {i18n.t("settings.nostr_keys.import_profile")}
                            </NiceP>
                        </div>
                    </ButtonCard>
                </Show>
                <BalanceBox loading={state.wallet_loading} />
                <NavBar activeTab="profile" />
            </DefaultMain>
        </MutinyWalletGuard>
    );
}
