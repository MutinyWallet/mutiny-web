import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";

import { Button, ButtonLink, DefaultMain, ImportNsecForm } from "~/components";
import { useMegaStore } from "~/state/megaStore";

export function ImportProfile() {
    const [state, _actions] = useMegaStore();
    const navigate = useNavigate();

    async function handleSkip() {
        // set up an empty profile so we at least have some kind0 event
        await state.mutiny_wallet?.edit_nostr_profile(
            "Anon",
            undefined,
            undefined,
            undefined
        );
        localStorage.setItem("profile_setup_stage", "skipped");
        navigate("/");
    }

    // @ts-expect-error we're checking for an extension
    const windowHasNostr = window.nostr && window.nostr.getPublicKey;

    return (
        <DefaultMain>
            <div class="mx-auto flex max-w-[20rem] flex-1 flex-col items-center gap-4">
                <div class="flex-1" />
                <h1 class="text-3xl font-semibold">Import nostr profile</h1>
                <p class="text-center text-xl font-light text-neutral-200">
                    Login with an existing nostr account.
                    <br />
                </p>
                <div class="flex-1" />
                <ImportNsecForm />
                <div class="flex-1" />
                <div class="flex flex-col items-center">
                    {/* Don't want them to accidentally "edit" their profile if they have one */}
                    <Show when={!windowHasNostr}>
                        <ButtonLink href="/newprofile" intent="text">
                            Create new nostr profile
                        </ButtonLink>
                    </Show>
                    <Button onClick={handleSkip} intent="text">
                        Skip for now
                    </Button>
                </div>
                <div class="flex-1" />
            </div>
        </DefaultMain>
    );
}
