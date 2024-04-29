import { createForm, email } from "@modular-forms/solid";
import { createFileUploader } from "@solid-primitives/upload";
import { Pencil } from "lucide-solid";
import { createSignal, Match, Show, Switch } from "solid-js";

import { Button, InfoBox, TextField, VStack } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { blobToBase64, eify } from "~/utils";

export type EditableProfile = {
    nym?: string;
    lightningAddress?: string;
    imageUrl?: string;
};

export function EditProfileForm(props: {
    initialProfile?: EditableProfile;
    onSave: (profile: EditableProfile) => Promise<void>;
    saving: boolean;
    cta: string;
}) {
    const [state] = useMegaStore();
    const [uploading, setUploading] = createSignal(false);
    const [uploadError, setUploadError] = createSignal<Error>();

    const { files, selectFiles } = createFileUploader({
        multiple: false,
        accept: "image/*"
    });

    async function uploadFile() {
        console.log("uploadFile");
        await selectFiles(async (files) => {
            if (files.length) {
                return;
            }
        });
    }

    const i18n = useI18n();
    const [profileForm, { Form, Field }] = createForm<EditableProfile>({
        initialValues: { ...props.initialProfile }
    });

    async function handleSubmit(profile: EditableProfile) {
        setUploading(true);
        setUploadError(undefined);
        try {
            let imageUrl;
            if (files() && files().length) {
                const base64 = await blobToBase64(files()[0].file);
                if (base64) {
                    imageUrl =
                        await state.mutiny_wallet?.upload_profile_pic(base64);
                }
            }
            await props.onSave({
                nym: profile.nym,
                lightningAddress: profile.lightningAddress,
                imageUrl: imageUrl ? imageUrl : props.initialProfile?.imageUrl
            });
        } catch (e) {
            setUploadError(eify(e));
            console.error(e);
        }
        setUploading(false);
    }

    return (
        <>
            <VStack>
                <button class="relative self-center" onClick={uploadFile}>
                    <div class="shiny-button flex h-[8rem] w-[8rem] flex-none items-center justify-center self-center overflow-clip rounded-full bg-m-grey-800 text-5xl uppercase">
                        <Switch>
                            <Match when={files() && files().length}>
                                <img src={files()[0].source} />
                            </Match>
                            <Match when={props.initialProfile?.imageUrl}>
                                <img src={props.initialProfile?.imageUrl} />
                            </Match>
                        </Switch>
                    </div>
                    <div class="absolute top-0 flex h-[8rem] w-[8rem] items-center justify-center bg-m-grey-975/25">
                        <Pencil />
                    </div>
                </button>
                <VStack>
                    <Form
                        onSubmit={handleSubmit}
                        class="mx-auto flex w-full flex-1 flex-col justify-around gap-4"
                    >
                        <Field name="nym">
                            {(field, props) => (
                                <TextField
                                    {...props}
                                    placeholder={i18n.t("contacts.placeholder")}
                                    value={field.value}
                                    error={field.error}
                                    label={i18n.t("profile.edit.nym")}
                                />
                            )}
                        </Field>
                        <Show when={props.cta !== "Create"}>
                            <Field
                                name="lightningAddress"
                                validate={[
                                    email(i18n.t("contacts.email_error"))
                                ]}
                            >
                                {(field, props) => (
                                    <TextField
                                        {...props}
                                        placeholder="example@example.com"
                                        value={field.value}
                                        error={field.error}
                                        label={i18n.t("contacts.ln_address")}
                                    />
                                )}
                            </Field>
                        </Show>
                        <Button
                            layout="full"
                            type="submit"
                            loading={
                                props.saving ||
                                uploading() ||
                                profileForm.submitting
                            }
                        >
                            {props.cta}
                        </Button>
                    </Form>
                    <Show when={uploadError()}>
                        <InfoBox accent="red">{uploadError()?.message}</InfoBox>
                    </Show>
                </VStack>
            </VStack>
            <div class="flex-1" />
        </>
    );
}
