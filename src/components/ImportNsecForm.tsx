import { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { useNavigate } from "@solidjs/router";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { createSignal, Show } from "solid-js";

import { Button, InfoBox, SimpleInput } from "~/components";
import { useMegaStore } from "~/state/megaStore";

export function ImportNsecForm(props: { setup?: boolean }) {
    const [state, _actions] = useMegaStore();
    const navigate = useNavigate();
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

            const new_npub = await state.mutiny_wallet?.change_nostr_keys(
                trimmedNsec,
                undefined
            );
            console.log("Changed to new npub: ", new_npub);
            if (props.setup) {
                navigate("/addfederation");
            } else {
                navigate("/");
            }
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
