import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";

import {
    Button,
    ButtonLink,
    DefaultMain,
    EditableProfile,
    EditProfileForm
} from "~/components";
import { useMegaStore } from "~/state/megaStore";

export function NewProfile() {
    const [state, _actions] = useMegaStore();

    const [creating, setCreating] = createSignal(false);

    const navigate = useNavigate();

    function handleSkip() {
        localStorage.setItem("profile_setup_stage", "skipped");
        navigate("/");
    }

    async function createProfile(p: EditableProfile) {
        setCreating(true);
        try {
            const profile = await state.mutiny_wallet?.edit_nostr_profile(
                p.nym ? p.nym : undefined,
                p.imageUrl ? p.imageUrl : undefined,
                undefined,
                undefined
            );
            console.log("profile", profile);
            localStorage.setItem("profile_setup_stage", "saved");
            navigate("/");
        } catch (e) {
            console.error(e);
        }
        setCreating(false);
    }

    return (
        <DefaultMain>
            <div class="mx-auto flex max-w-[20rem] flex-1 flex-col items-center gap-4">
                <div class="flex-1" />
                <h1 class="text-3xl font-semibold">Create your profile</h1>
                <p class="text-center text-xl font-light text-neutral-200">
                    Mutiny makes payments social.
                    <br />
                    Your activity is private by default.
                </p>
                <div class="flex-1" />
                <EditProfileForm
                    onSave={createProfile}
                    saving={creating()}
                    cta="Create"
                />
                <div class="flex flex-col items-center">
                    <ButtonLink href="/importprofile" intent="text">
                        Import existing nostr profile
                    </ButtonLink>
                    <Button onClick={handleSkip} intent="text">
                        Skip for now
                    </Button>
                </div>
                <div class="flex-1" />
            </div>
        </DefaultMain>
    );
}
