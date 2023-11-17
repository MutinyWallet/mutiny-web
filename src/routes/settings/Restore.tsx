import { Clipboard } from "@capacitor/clipboard";
import { Capacitor } from "@capacitor/core";
import { TextField as KTextField } from "@kobalte/core";
import {
    createForm,
    custom,
    required,
    setValues,
    SubmitHandler,
    validate
} from "@modular-forms/solid";
import { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { createSignal, For, Show, splitProps } from "solid-js";

import pasteIcon from "~/assets/icons/paste.svg";
import {
    BackLink,
    Button,
    ConfirmDialog,
    DefaultMain,
    InfoBox,
    LargeHeader,
    NavBar,
    NiceP,
    SafeArea,
    showToast,
    TextFieldProps,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify, WORDS_EN } from "~/utils";

type SeedWordsForm = {
    words: string[];
};

// create an array of 12 empty strings
const initialValues: SeedWordsForm = {
    words: Array.from({ length: 12 }, () => "")
};

function validateWord(word?: string): boolean {
    // return word?.trim() === "bacon";
    return WORDS_EN.includes(word?.trim() ?? "");
}

function SeedTextField(props: TextFieldProps) {
    const [fieldProps] = splitProps(props, [
        "placeholder",
        "ref",
        "onInput",
        "onChange",
        "onBlur"
    ]);
    return (
        <KTextField.Root
            class="flex flex-col gap-2"
            name={props.name}
            value={props.value}
            validationState={props.error ? "invalid" : "valid"}
            required={props.required}
        >
            <KTextField.Input
                {...fieldProps}
                autoCapitalize="none"
                autocorrect="off"
                autocomplete="off"
                type={props.type}
                class="w-full rounded-lg border bg-m-grey-750 p-2 placeholder-neutral-400"
                classList={{
                    "border-m-grey-750": !props.error && !props.value,
                    "border-m-red": !!props.error,
                    "border-m-green": !props.error && !!props.value
                }}
            />
        </KTextField.Root>
    );
}

function TwelveWordsEntry() {
    const i18n = useI18n();
    const [state, actions] = useMegaStore();

    const [error, setError] = createSignal<Error>();
    const [mnemnoic, setMnemonic] = createSignal<string>();

    const [confirmOpen, setConfirmOpen] = createSignal(false);
    const [confirmLoading, setConfirmLoading] = createSignal(false);

    const [seedWordsForm, { Form, Field, FieldArray }] =
        createForm<SeedWordsForm>({
            initialValues,
            validateOn: "blur"
        });

    async function handlePaste() {
        try {
            let text: string;

            if (Capacitor.isNativePlatform()) {
                const { value } = await Clipboard.read();
                text = value;
            } else {
                if (!navigator.clipboard.readText) {
                    return showToast(
                        new Error(i18n.t("settings.restore.error_clipboard"))
                    );
                }
                text = await navigator.clipboard.readText();
            }

            // split words on space or newline
            const words = text.trim().split(/[\s\n]+/);

            if (words.length !== 12) {
                return showToast(
                    new Error(i18n.t("settings.restore.error_word_number"))
                );
            }

            setValues(seedWordsForm, "words", words);
            validate(seedWordsForm);
        } catch (e) {
            console.error(e);
        }
    }

    async function restore() {
        try {
            setConfirmLoading(true);

            if (state.mutiny_wallet) {
                console.log("Mutiny wallet loaded, stopping");
                try {
                    await state.mutiny_wallet.stop();
                    actions.dropMutinyWallet();
                } catch (e) {
                    console.error(e);
                }
            }

            await MutinyWallet.restore_mnemonic(mnemnoic() || "", "");

            actions.setHasBackedUp();

            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
        } catch (e) {
            setError(eify(e));
        } finally {
            setConfirmLoading(false);
        }
    }

    const onSubmit: SubmitHandler<SeedWordsForm> = async (values) => {
        setError(undefined);
        const valid = values.words?.every(validateWord);

        if (!valid) {
            setError(new Error(i18n.t("settings.restore.error_invalid_seed")));
            return;
        }

        const seed = values.words?.join(" ");
        setMnemonic(seed);
        setConfirmOpen(true);
    };

    return (
        <>
            <Form onSubmit={onSubmit} class="flex flex-col gap-4">
                <div class="flex flex-col gap-4 overflow-hidden rounded-xl bg-m-grey-800 p-4">
                    <Show when={error()}>
                        <InfoBox accent="red">{error()?.message}</InfoBox>
                    </Show>
                    <ul class="w-full list-none columns-2 overflow-hidden pr-2 pt-2">
                        <FieldArray name="words">
                            {(fieldArray) => (
                                <For each={fieldArray.items}>
                                    {(_, index) => (
                                        <div class="mb-2 flex items-center gap-1">
                                            <pre class="w-[2rem] text-right">
                                                {index() + 1}
                                                {"."}
                                            </pre>
                                            <Field
                                                name={`words.${index()}`}
                                                validate={[
                                                    required(
                                                        i18n.t(
                                                            "settings.restore.all_twelve"
                                                        )
                                                    ),
                                                    custom(
                                                        validateWord,
                                                        i18n.t(
                                                            "settings.restore.wrong_word"
                                                        )
                                                    )
                                                ]}
                                            >
                                                {(field, props) => (
                                                    <SeedTextField
                                                        {...props}
                                                        value={field.value}
                                                        error={field.error}
                                                    />
                                                )}
                                            </Field>
                                        </div>
                                    )}
                                </For>
                            )}
                        </FieldArray>
                    </ul>
                    <div class="flex w-full justify-center">
                        <button
                            onClick={handlePaste}
                            class="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
                            type="button"
                        >
                            <div class="flex items-center gap-2">
                                <span>{i18n.t("settings.restore.paste")}</span>
                                <img
                                    src={pasteIcon}
                                    alt="paste"
                                    class="h-4 w-4"
                                />
                            </div>
                        </button>
                    </div>
                </div>
                <Button
                    type="submit"
                    intent="red"
                    disabled={seedWordsForm.invalid || !seedWordsForm.dirty}
                >
                    {i18n.t("settings.restore.title")}
                </Button>
            </Form>
            <ConfirmDialog
                open={confirmOpen()}
                onConfirm={restore}
                onCancel={() => setConfirmOpen(false)}
                loading={confirmLoading()}
            >
                <p>{i18n.t("settings.restore.confirm_text")}</p>
            </ConfirmDialog>
        </>
    );
}

export function Restore() {
    const i18n = useI18n();
    return (
        <SafeArea>
            <DefaultMain>
                <BackLink title={i18n.t("settings.header")} href="/settings" />
                <LargeHeader>{i18n.t("settings.restore.title")}</LargeHeader>
                <VStack>
                    <NiceP>
                        <p>{i18n.t("settings.restore.restore_tip")}</p>
                        <p>
                            {i18n.t("settings.restore.multi_browser_warning")}
                        </p>
                    </NiceP>
                    <TwelveWordsEntry />
                </VStack>
            </DefaultMain>
            <NavBar activeTab="settings" />
        </SafeArea>
    );
}
