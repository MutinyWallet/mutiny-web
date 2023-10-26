import { createForm } from "@modular-forms/solid";
import { createSignal, Show } from "solid-js";
import { useNavigate } from "solid-start";

import {
    Button,
    ExternalLink,
    InfoBox,
    NiceP,
    SelectField,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify, timeout } from "~/utils";

export interface Currency {
    value: string;
    label: string;
    hasSymbol?: string;
    maxFractionalDigits: number;
}

type ChooseCurrencyForm = {
    fiatCurrency: string;
};

/**
 *  FIAT_OPTIONS is an array of possible currencies
 *  All available currencies can be found here https://api.coingecko.com/api/v3/simple/supported_vs_currencies
 *  @Currency
 *  @param {string} label - should be in the format {Name} {ISO code}
 *  @param {string} values - are uppercase ISO 4217 currency code
 *  @param {string?} hasSymbol - if the currency has a symbol it should be represented as a string
 *  @param {number} maxFractionalDigits - the standard fractional units used by the currency should be set with maxFractionalDigits
 *
 *  Bitcoin is represented as:
 *  {
 *      label: "bitcoin BTC",
 *      value: "BTC",
 *      hasSymbol: "₿",
 *      maxFractionalDigits: 8
 *  }
 */

//Bitcoin and USD need to be FIAT_OPTIONS[0] and FIAT_OPTIONS[1] respectively, they are called in megaStore.tsx
export const FIAT_OPTIONS: Currency[] = [
    {
        label: "Bitcoin BTC",
        value: "BTC",
        hasSymbol: "₿",
        maxFractionalDigits: 8
    },
    {
        label: "United States Dollar USD",
        value: "USD",
        hasSymbol: "$",
        maxFractionalDigits: 2
    },
    { label: "Swiss Franc CHF", value: "CHF", maxFractionalDigits: 2 },
    {
        label: "Chinese Yuan CNY",
        value: "CNY",
        hasSymbol: "¥",
        maxFractionalDigits: 2
    },
    {
        label: "Euro EUR",
        value: "EUR",
        hasSymbol: "€",
        maxFractionalDigits: 2
    },
    {
        label: "Brazilian Real BRL",
        value: "BRL",
        hasSymbol: "R$",
        maxFractionalDigits: 2
    },
    {
        label: "British Pound GBP",
        value: "GBP",
        hasSymbol: "₤",
        maxFractionalDigits: 2
    },
    {
        label: "Australia Dollar AUD",
        value: "AUD",
        hasSymbol: "$",
        maxFractionalDigits: 2
    },
    {
        label: "Japanese Yen JPY",
        value: "JPY",
        hasSymbol: "¥",
        maxFractionalDigits: 0
    },
    {
        label: "Korean Won KRW",
        value: "KRW",
        hasSymbol: "₩",
        maxFractionalDigits: 0
    },
    { label: "Kuwaiti Dinar KWD", value: "KWD", maxFractionalDigits: 3 }
];

export function ChooseCurrency() {
    const i18n = useI18n();
    const [error, setError] = createSignal<Error>();
    const [state, actions] = useMegaStore();
    const [loading, setLoading] = createSignal(false);
    const navigate = useNavigate();

    function findCurrencyByValue(value: string) {
        return FIAT_OPTIONS.find((currency) => currency.value === value);
    }

    const [_chooseCurrencyForm, { Form, Field }] =
        createForm<ChooseCurrencyForm>({
            initialValues: {
                fiatCurrency: ""
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
            actions.saveFiat(findCurrencyByValue(f.fiatCurrency) || state.fiat);

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
                            <SelectField
                                {...props}
                                value={field.value}
                                error={field.error}
                                placeholder={state.fiat.label}
                                options={FIAT_OPTIONS}
                                label={i18n.t(
                                    "settings.currency.select_currency_label"
                                )}
                            />
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
