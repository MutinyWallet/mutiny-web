import { useNavigate } from "@solidjs/router";
import { AtSign, Edit, Import } from "lucide-solid";
import { createMemo, Show } from "solid-js";

import {
    BackLink,
    BalanceBox,
    ButtonCard,
    DefaultMain,
    LabelCircle,
    LightningAddressShower,
    MutinyWalletGuard,
    NavBar,
    NiceP
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { DEFAULT_NOSTR_NAME } from "~/utils";

export type UserProfile = {
    name: string;
    picture?: string;
    lud16?: string;
    deleted: boolean | string;
};

export function Profile() {
    const [state, _actions] = useMegaStore();
    const i18n = useI18n();

    const navigate = useNavigate();

    const profile = createMemo(() => {
        const profile = state.mutiny_wallet?.get_nostr_profile();

        const userProfile: UserProfile = {
            name: profile?.display_name || profile?.name || DEFAULT_NOSTR_NAME,
            picture: profile?.picture || undefined,
            lud16: profile?.lud16 || undefined,
            deleted: profile?.deleted || false
        };
        return userProfile;
    });

    const profileDeleted = createMemo(() => {
        return profile().deleted === true || profile().deleted === "true";
    });

    const hasMutinyAddress = createMemo(() => {
        if (profile().lud16) {
            const hermes = import.meta.env.VITE_HERMES;
            if (!hermes) {
                return false;
            }
            const hermesDomain = new URL(hermes).hostname;
            const afterAt = profile().lud16!.split("@")[1];
            if (afterAt && afterAt.includes(hermesDomain)) {
                return true;
            }
        }
        return false;
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

                        <LightningAddressShower profile={profile()} />
                    </div>
                    <ButtonCard onClick={() => navigate("/editprofile")}>
                        <div class="flex items-center gap-2">
                            {/* <Users class="inline-block text-m-red" /> */}
                            <Edit class="inline-block text-m-red" />
                            <NiceP>{i18n.t("profile.edit_profile")}</NiceP>
                        </div>
                    </ButtonCard>
                    <Show
                        when={
                            !hasMutinyAddress() && import.meta.env.VITE_HERMES
                        }
                    >
                        <ButtonCard
                            onClick={() =>
                                navigate("/settings/lightningaddress")
                            }
                        >
                            <div class="flex items-center gap-2">
                                <AtSign class="inline-block text-m-red" />
                                <NiceP>
                                    {i18n.t(
                                        "settings.lightning_address.create"
                                    )}
                                </NiceP>
                            </div>
                        </ButtonCard>
                    </Show>
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
