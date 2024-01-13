import { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { useNavigate } from "@solidjs/router";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { createSignal, Show } from "solid-js";

import {
    Button,
    ButtonLink,
    DefaultMain,
    InfoBox,
    SimpleInput
} from "~/components";

export function ImportProfile() {
    const [nsec, setNsec] = createSignal("");
    const [saving, setSaving] = createSignal(false);
    const [error, setError] = createSignal<string | undefined>();

    const navigate = useNavigate();

    function handleSkip() {
        localStorage.setItem("profile_setup_stage", "skipped");
        navigate("/");
    }

    async function saveNsec() {
        setSaving(true);
        setError(undefined);
        const trimmedNsec = nsec().trim();
        try {
            const npub = await MutinyWallet.nsec_to_npub(trimmedNsec);
            if (!npub) {
                throw new Error("Invalid nsec");
            }
            await SecureStoragePlugin.set({ key: "nsec", value: trimmedNsec });
            // TODO: right now we need a reload to set the nsec
            window.location.href = "/";
        } catch (e) {
            console.error(e);
            setError("Invalid nsec");
        }
        setSaving(false);
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
                <SimpleInput
                    value={nsec()}
                    onInput={(e) => setNsec(e.currentTarget.value)}
                    placeholder={`Nostr private key (starts with "nsec")`}
                />
                <Button layout="full" onClick={saveNsec} loading={saving()}>
                    Import
                </Button>
                <Show when={error()}>
                    <InfoBox accent="red">{error()}</InfoBox>
                </Show>
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
