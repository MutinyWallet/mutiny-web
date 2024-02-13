import { createForm } from "@modular-forms/solid";
import { useNavigate } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";

import { Button, ExternalLink, InfoBox, NiceP, VStack } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify, EN_OPTION, Language, LANGUAGE_OPTIONS, timeout } from "~/utils";

type ChooseLanguageForm = {
    selectedLanguage: string;
};

const COMBINED_OPTIONS: Language[] = [EN_OPTION, ...LANGUAGE_OPTIONS];

export function ChooseLanguage() {
    const i18n = useI18n();
    const [error, setError] = createSignal<Error>();
    const [state, actions] = useMegaStore();
    const [loading, setLoading] = createSignal(false);
    const navigate = useNavigate();

    const [_chooseLanguageForm, { Form, Field }] =
        createForm<ChooseLanguageForm>({
            initialValues: {
                selectedLanguage: state.lang ?? i18n.language
            },
            validate: (values) => {
                const errors: Record<string, string> = {};
                if (values.selectedLanguage === undefined) {
                    errors.selectedLanguage = i18n.t(
                        "settings.language.error_unsupported_language"
                    );
                }
                return errors;
            }
        });

    const handleFormSubmit = async (f: ChooseLanguageForm) => {
        setLoading(true);
        try {
            actions.saveLanguage(f.selectedLanguage);

            await i18n.changeLanguage(f.selectedLanguage);

            await timeout(1000);
            navigate("/");
        } catch (e) {
            console.error(e);
            setError(eify(e));
            setLoading(false);
        }
    };

    return (
        <VStack>
            <Form onSubmit={handleFormSubmit} class="flex flex-col gap-4">
                <NiceP>{i18n.t("settings.language.caption")}</NiceP>
                <ExternalLink href="https://github.com/MutinyWallet/mutiny-web/issues/new">
                    {i18n.t("settings.language.request_language_support_link")}
                </ExternalLink>
                <div />
                <VStack>
                    <Field name="selectedLanguage">
                        {(field, props) => (
                            <select
                                {...props}
                                value={field.value}
                                class="w-full rounded-lg bg-m-grey-750 py-2 pl-4 pr-12 text-base font-normal text-white"
                            >
                                <For each={COMBINED_OPTIONS}>
                                    {({ value, shortName }) => (
                                        <option
                                            selected={field.value === shortName}
                                            value={shortName}
                                        >
                                            {value}
                                        </option>
                                    )}
                                </For>
                            </select>
                        )}
                    </Field>
                    <Show when={error()}>
                        <InfoBox accent="red">{error()?.message}</InfoBox>
                    </Show>
                    <div />
                    <Button intent="blue" loading={loading()}>
                        {i18n.t("settings.language.select_language")}
                    </Button>
                </VStack>
            </Form>
        </VStack>
    );
}
