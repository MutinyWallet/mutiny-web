import { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { createSignal, Show } from "solid-js";

import { Button, InfoBox, SimpleInput } from "~/components";

export function ImportNsecForm() {
    const [nsec, setNsec] = createSignal("");
    const [saving, setSaving] = createSignal(false);
    const [error, setError] = createSignal<string | undefined>();

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

    return (
        <>
            <SimpleInput
                value={nsec()}
                type="password"
                onInput={(e) => setNsec(e.currentTarget.value)}
                placeholder={`Nostr private key (starts with "nsec")`}
            />
            <Button layout="full" onClick={saveNsec} loading={saving()}>
                Import
            </Button>
            <Show when={error()}>
                <InfoBox accent="red">{error()}</InfoBox>
            </Show>
        </>
    );
}
