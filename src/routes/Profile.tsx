import { createAsync, useNavigate } from "@solidjs/router";
import { Edit, Import } from "lucide-solid";
import { createMemo, Show, Suspense } from "solid-js";

import {
    BackLink,
    BalanceBox,
    ButtonCard,
    DefaultMain,
    LabelCircle,
    LightningAddressShower,
    LoadingShimmer,
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
    const [state, _actions, sw] = useMegaStore();
    const i18n = useI18n();

    const navigate = useNavigate();

    const profile = createAsync(async () => {
        const profile = await sw.get_nostr_profile();

        const userProfile: UserProfile = {
            name: profile?.display_name || profile?.name || DEFAULT_NOSTR_NAME,
            picture: profile?.picture || undefined,
            lud16: profile?.lud16 || undefined,
            deleted: profile?.deleted || false
        };
        return userProfile;
    });

    const profileDeleted = createMemo(() => {
        return profile()?.deleted === true || profile()?.deleted === "true";
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
                            image_url={profile()?.picture}
                            size="xl"
                        />
                        <h1 class="text-3xl font-semibold">
                            <Show when={profile()?.name}>
                                {profile()?.name}
                            </Show>
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
                </Show>
                <Show when={profile() && profile()?.deleted}>
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
                <Suspense fallback={<LoadingShimmer />}>
                    <BalanceBox loading={state.wallet_loading} />
                </Suspense>
                <NavBar activeTab="profile" />
            </DefaultMain>
        </MutinyWalletGuard>
    );
}
