import { A, useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";

import {
    Button,
    DefaultMain,
    EditableProfile,
    EditProfileForm
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { DEFAULT_NOSTR_NAME } from "~/utils";

export function NewProfile() {
    const [state, _actions] = useMegaStore();
    const i18n = useI18n();

    const [creating, setCreating] = createSignal(false);
    const [skipping, setSkipping] = createSignal(false);

    const navigate = useNavigate();

    async function handleSkip() {
        setSkipping(true);
        // set up an empty profile so we at least have some kind0 event
        const profile = await state.mutiny_wallet?.setup_new_profile(
            DEFAULT_NOSTR_NAME,
            undefined,
            undefined,
            undefined
        );
        console.log("profile", profile);
        localStorage.setItem("profile_setup_stage", "skipped");
        navigate("/addfederation");
        setSkipping(false);
    }

    async function createProfile(p: EditableProfile) {
        setCreating(true);
        try {
            const profile = await state.mutiny_wallet?.setup_new_profile(
                p.nym ? p.nym : DEFAULT_NOSTR_NAME,
                p.imageUrl ? p.imageUrl : undefined,
                undefined,
                undefined
            );
            console.log("profile", profile);
            localStorage.setItem("profile_setup_stage", "saved");
            navigate("/addfederation");
        } catch (e) {
            console.error(e);
        }
        setCreating(false);
    }

    return (
        <DefaultMain>
            <div class="mx-auto flex max-w-[20rem] flex-1 flex-col items-center gap-4">
                <div class="flex-1" />
                <h1 class="text-3xl font-semibold">
                    {i18n.t("setup.new_profile.title")}
                </h1>
                <p class="text-center text-xl font-light text-neutral-200">
                    {i18n.t("setup.new_profile.description")}
                </p>
                <div class="flex-1" />
                <EditProfileForm
                    onSave={createProfile}
                    saving={creating()}
                    cta="Create"
                />
                <Button onClick={handleSkip} intent="text" loading={skipping()}>
                    {i18n.t("setup.skip")}
                </Button>
                <A
                    class="text-base font-normal text-m-grey-400"
                    href="/importprofile"
                >
                    {i18n.t("setup.import_profile")}
                </A>
                <div class="flex-1" />
            </div>
        </DefaultMain>
    );
}
