import { useNavigate } from "@solidjs/router";
import { createMemo, createSignal, Show } from "solid-js";

import {
    BackLink,
    ButtonLink,
    DefaultMain,
    EditableProfile,
    EditProfileForm,
    LargeHeader,
    MutinyWalletGuard,
    NavBar,
    NiceP
} from "~/components";
// import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function EditProfile() {
    const [state, _actions] = useMegaStore();
    // const i18n = useI18n();
    const navigate = useNavigate();

    const [saving, setSaving] = createSignal(false);

    const originalProfile = createMemo(() => {
        const profile = state.mutiny_wallet?.get_nostr_profile();

        return {
            name: profile?.display_name || profile?.name || "Anon",
            picture: profile?.picture || undefined,
            lud16: profile?.lud16 || undefined,
            nip05: profile?.nip05 || undefined
        };
    });

    async function saveProfile(profile: EditableProfile) {
        try {
            setSaving(true);

            const newProfile = await state.mutiny_wallet?.edit_nostr_profile(
                profile.nym,
                profile.imageUrl,
                originalProfile().lud16,
                originalProfile().nip05
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
                <NiceP>
                    Update your profile.
                    <br />
                    Your activity is private by default.
                </NiceP>
                <div class="flex-1" />
                <Show when={originalProfile()}>
                    <EditProfileForm
                        initialProfile={{
                            nym: originalProfile().name,
                            imageUrl: originalProfile().picture
                        }}
                        onSave={saveProfile}
                        saving={saving()}
                        cta="Save"
                    />
                </Show>
                <ButtonLink href="/importprofile" intent="text">
                    Import different nostr profile
                </ButtonLink>

                <NavBar activeTab="profile" />
            </DefaultMain>
        </MutinyWalletGuard>
    );
}
