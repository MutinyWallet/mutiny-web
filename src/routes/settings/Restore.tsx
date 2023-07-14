import {
    Button,
    DefaultMain,
    LargeHeader,
    NiceP,
    SafeArea,
    VStack
} from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import NavBar from "~/components/NavBar";
import { useMegaStore } from "~/state/megaStore";
import { For, Show, createSignal, splitProps } from "solid-js";
import pasteIcon from "~/assets/icons/paste.svg";
import {
    SubmitHandler,
    createForm,
    custom,
    required,
    setValues,
    validate
} from "@modular-forms/solid";
import { TextField as KTextField } from "@kobalte/core";
import { TextFieldProps } from "~/components/layout/TextField";
import { showToast } from "~/components/Toaster";
import eify from "~/utils/eify";
import { ConfirmDialog } from "~/components/Dialog";
import { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { WORDS_EN } from "~/utils/words";
import { InfoBox } from "~/components/InfoBox";

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

export function SeedTextField(props: TextFieldProps) {
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
                class="w-full p-2 rounded-lg border bg-m-grey-750 placeholder-neutral-400"
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
    const [state, _actions] = useMegaStore();

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
        if (!navigator.clipboard.readText)
            return showToast(new Error("Clipboard not supported"));

        try {
            const text = await navigator.clipboard.readText();

            // split words on space or newline
            const words = text.split(/[\s\n]+/);

            if (words.length !== 12)
                return showToast(new Error("Wrong number of words"));

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
                } catch (e) {
                    console.error(e);
                }
            }

            await MutinyWallet.restore_mnemonic(mnemnoic() || "", "");

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
            setError(new Error("Invalid seed phrase"));
            return;
        }

        const seed = values.words?.join(" ");
        setMnemonic(seed);
        setConfirmOpen(true);
    };

    return (
        <>
            <Form onSubmit={onSubmit} class="flex flex-col gap-4">
                <div class="flex flex-col gap-4 bg-m-grey-800 p-4 rounded-xl overflow-hidden">
                    <Show when={error()}>
                        <InfoBox accent="red">{error()?.message}</InfoBox>
                    </Show>
                    <ul class="overflow-hidden columns-2 w-full list-none pt-2 pr-2">
                        <FieldArray name="words">
                            {(fieldArray) => (
                                <For each={fieldArray.items}>
                                    {(_, index) => (
                                        <div class="flex items-center gap-1 mb-2">
                                            <pre class="w-[2rem] text-right">
                                                {index() + 1}
                                                {"."}
                                            </pre>
                                            <Field
                                                name={`words.${index()}`}
                                                validate={[
                                                    required(
                                                        "You need to enter all 12 words"
                                                    ),
                                                    custom(
                                                        validateWord,
                                                        "Wrong word"
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
                            class="bg-white/10 hover:bg-white/20 py-2 px-4 rounded-lg"
                            type="button"
                        >
                            <div class="flex items-center gap-2">
                                <span>Dangerously Paste from Clipboard</span>
                                <img
                                    src={pasteIcon}
                                    alt="paste"
                                    class="w-4 h-4"
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
                    Restore
                </Button>
            </Form>
            <ConfirmDialog
                open={confirmOpen()}
                onConfirm={restore}
                onCancel={() => setConfirmOpen(false)}
                loading={confirmLoading()}
            >
                <p>
                    Are you sure you want to restore to this wallet? Your
                    existing wallet will be deleted!
                </p>
            </ConfirmDialog>
        </>
    );
}

export default function RestorePage() {
    return (
        <SafeArea>
            <DefaultMain>
                <BackLink title="Settings" href="/settings" />
                <LargeHeader>Restore</LargeHeader>
                <VStack>
                    <NiceP>
                        <p>
                            You can restore an existing Mutiny Wallet from your 12
                            word seed phrase. This will replace your existing
                            wallet, so make sure you know what you're doing!
                        </p>
                        <p>
			    Do not use on multiple browsers at the same time.
                        </p>
                    </NiceP>
                    <TwelveWordsEntry />
                </VStack>
            </DefaultMain>
            <NavBar activeTab="settings" />
        </SafeArea>
    );
}

