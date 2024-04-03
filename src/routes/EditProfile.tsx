import { useNavigate } from "@solidjs/router";
import { createMemo, createSignal, Show } from "solid-js";

import {
    BackLink,
    DefaultMain,
    EditableProfile,
    EditProfileForm,
    LargeHeader,
    MutinyWalletGuard,
    NavBar
} from "~/components";
import { useMegaStore } from "~/state/megaStore";
import { DEFAULT_NOSTR_NAME } from "~/utils";

export function EditProfile() {
    const [state, _actions] = useMegaStore();
    // const i18n = useI18n();
    const navigate = useNavigate();

    const [saving, setSaving] = createSignal(false);

    const originalProfile = createMemo(() => {
        const profile = state.mutiny_wallet?.get_nostr_profile();

        return {
            name: profile?.display_name || profile?.name || DEFAULT_NOSTR_NAME,
            picture: profile?.picture || undefined,
            lud16: profile?.lud16 || undefined,
            nip05: profile?.nip05 || undefined
        };
    });

    async function saveProfile(profile: EditableProfile) {
        try {
            setSaving(true);

            console.log("new profile", profile);

            const newProfile = await state.mutiny_wallet?.edit_nostr_profile(
                profile.nym ? profile.nym : undefined,
                profile.imageUrl ? profile.imageUrl : undefined,
                profile.lightningAddress ? profile.lightningAddress : undefined,
                originalProfile().nip05 ? originalProfile().nip05 : undefined
            );

            console.log("newProfile", newProfile);

            setSaving(false);
            navigate("/profile");
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <BackLink href="/profile" title="Profile" />
                <LargeHeader>Edit Profile</LargeHeader>
                <div class="flex-1" />
                <Show when={originalProfile()}>
                    <EditProfileForm
                        initialProfile={{
                            nym: originalProfile().name,
                            lightningAddress: originalProfile().lud16,
                            imageUrl: originalProfile().picture
                        }}
                        onSave={saveProfile}
                        saving={saving()}
                        cta="Save"
                    />
                </Show>
                <NavBar activeTab="profile" />
            </DefaultMain>
        </MutinyWalletGuard>
    );
}
