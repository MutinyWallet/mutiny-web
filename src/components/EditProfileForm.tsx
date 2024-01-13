import { createFileUploader } from "@solid-primitives/upload";
import { createSignal, Match, Switch } from "solid-js";

import { Button, SimpleInput } from "~/components";
import { useMegaStore } from "~/state/megaStore";
import { blobToBase64 } from "~/utils";

export type EditableProfile = {
    nym?: string;
    imageUrl?: string;
};

export function EditProfileForm(props: {
    initialProfile?: EditableProfile;
    onSave: (profile: EditableProfile) => Promise<void>;
    saving: boolean;
    cta: string;
}) {
    const [state] = useMegaStore();
    const [nym, setNym] = createSignal(props.initialProfile?.nym || "");
    const [uploading, setUploading] = createSignal(false);

    const { files, selectFiles } = createFileUploader({
        multiple: false,
        accept: "image/*"
    });

    async function uploadFile() {
        selectFiles(async (files) => {
            if (files.length) {
                return;
            }
        });
    }

    async function onSave() {
        try {
            let imageUrl;
            if (files() && files().length) {
                setUploading(true);
                const base64 = await blobToBase64(files()[0].file);
                if (base64) {
                    imageUrl =
                        await state.mutiny_wallet?.upload_profile_pic(base64);
                }
                setUploading(false);
            }
            await props.onSave({
                nym: nym(),
                imageUrl: imageUrl ? imageUrl : props.initialProfile?.imageUrl
            });
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <>
            <button
                class="shiny-button flex h-[8rem] w-[8rem] flex-none items-center justify-center self-center overflow-clip rounded-full bg-m-grey-800 text-5xl uppercase"
                onClick={uploadFile}
            >
                <Switch>
                    <Match when={files() && files().length}>
                        <img src={files()[0].source} />
                    </Match>
                    <Match when={props.initialProfile?.imageUrl}>
                        <img src={props.initialProfile?.imageUrl} />
                    </Match>
                    <Match when={true}>+</Match>
                </Switch>
            </button>
            <SimpleInput
                value={nym()}
                onInput={(e) => setNym(e.currentTarget.value)}
                placeholder="Your name or nym"
            />
            <div class="flex-1" />
            <Button
                layout="full"
                onClick={onSave}
                loading={props.saving || uploading()}
            >
                {props.cta}
            </Button>
        </>
    );
}
