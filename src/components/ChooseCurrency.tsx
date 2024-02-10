import { createForm } from "@modular-forms/solid";
import { useNavigate } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";

import { Button, ExternalLink, InfoBox, NiceP, VStack } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import {
    BTC_OPTION,
    Currency,
    eify,
    FIAT_OPTIONS,
    timeout,
    USD_OPTION
} from "~/utils";

type ChooseCurrencyForm = {
    fiatCurrency: string;
};

const COMBINED_OPTIONS: Currency[] = [USD_OPTION, BTC_OPTION, ...FIAT_OPTIONS];

export function ChooseCurrency() {
    const i18n = useI18n();
    const [error, setError] = createSignal<Error>();
    const [state, actions] = useMegaStore();
    const [loading, setLoading] = createSignal(false);
    const navigate = useNavigate();

    function findCurrencyByValue(value: string) {
        return (
            COMBINED_OPTIONS.find((currency) => currency.value === value) ??
            USD_OPTION
        );
    }

    const [_chooseCurrencyForm, { Form, Field }] =
        createForm<ChooseCurrencyForm>({
            initialValues: {
                fiatCurrency: state.fiat.value
            },
            validate: (values) => {
                const errors: Record<string, string> = {};
                if (values.fiatCurrency === undefined) {
                    errors.fiatCurrency = i18n.t(
                        "settings.currency.error_unsupported_currency"
                    );
                }
                return errors;
            }
        });

    const handleFormSubmit = async (f: ChooseCurrencyForm) => {
        setLoading(true);
        try {
            actions.saveFiat(findCurrencyByValue(f.fiatCurrency));

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
                <NiceP>{i18n.t("settings.currency.caption")}</NiceP>
                <ExternalLink href="https://github.com/MutinyWallet/mutiny-web/issues/new">
                    {i18n.t("settings.currency.request_currency_support_link")}
                </ExternalLink>
                <div />
                <VStack>
                    <Field name="fiatCurrency">
                        {(field, props) => (
                            <select
                                {...props}
                                value={field.value}
                                class="w-full rounded-lg bg-m-grey-750 py-2 pl-4 pr-12 text-base font-normal text-white"
                            >
                                <For each={COMBINED_OPTIONS}>
                                    {({ value, label }) => (
                                        <option
                                            selected={field.value === value}
                                            value={value}
                                        >
                                            {label}
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
                        {i18n.t("settings.currency.select_currency")}
                    </Button>
                </VStack>
            </Form>
        </VStack>
    );
}
