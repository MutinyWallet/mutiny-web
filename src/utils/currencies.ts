export interface Currency {
    value: string;
    label: string;
    hasSymbol?: string;
    maxFractionalDigits: number;
}

/**
 *  BTC_USD_OPTIONS is an array of BTC and USD currencies
 *  These are separated from the rest of the list for ease of access by the user and necessary access in the megaStore
 */

export const BTC_OPTION: Currency = {
    label: "Bitcoin BTC",
    value: "BTC",
    hasSymbol: "₿",
    maxFractionalDigits: 8
};

export const USD_OPTION: Currency = {
    label: "United States Dollar USD",
    value: "USD",
    hasSymbol: "$",
    maxFractionalDigits: 2
};

/**
 *  FIAT_OPTIONS is an array of all available currencies on the coingecko api https://api.coingecko.com/api/v3/simple/supported_vs_currencies
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

export const FIAT_OPTIONS: Currency[] = [
    {
        label: "United Arab Emirates Dirham AED",
        value: "AED",
        maxFractionalDigits: 2
    },
    {
        label: "Argentine Peso ARS",
        value: "ARS",
        hasSymbol: "$",
        maxFractionalDigits: 2
    },
    {
        label: "Australian Dollar AUD",
        value: "AUD",
        hasSymbol: "$",
        maxFractionalDigits: 2
    },
    {
        label: "Bangladeshi Taka BDT",
        value: "BDT",
        hasSymbol: "৳",
        maxFractionalDigits: 2
    },
    {
        label: "Bahraini Dinar BHD",
        value: "BHD",
        hasSymbol: "BD",
        maxFractionalDigits: 3
    },
    {
        label: "Bermuda Dollar BMD",
        value: "BMD",
        hasSymbol: "$",
        maxFractionalDigits: 2
    },
    {
        label: "Brazilian Real BRL",
        value: "BRL",
        hasSymbol: "R$",
        maxFractionalDigits: 2
    },
    {
        label: "Canadian Dollar CAD",
        value: "CAD",
        hasSymbol: "$",
        maxFractionalDigits: 2
    },
    { label: "Swiss Franc CHF", value: "CHF", maxFractionalDigits: 2 },
    {
        label: "Chilean Peso CLP",
        value: "CLP",
        hasSymbol: "$",
        maxFractionalDigits: 0
    },
    {
        label: "Chinese Yuan CNY",
        value: "CNY",
        hasSymbol: "¥",
        maxFractionalDigits: 2
    },
    {
        label: "Czech Koruna CZK",
        value: "CZK",
        hasSymbol: "Kč",
        maxFractionalDigits: 2
    },
    {
        label: "Danish Krone DKK",
        value: "DKK",
        hasSymbol: "kr",
        maxFractionalDigits: 2
    },
    {
        label: "Euro EUR",
        value: "EUR",
        hasSymbol: "€",
        maxFractionalDigits: 2
    },
    {
        label: "British Pound GBP",
        value: "GBP",
        hasSymbol: "₤",
        maxFractionalDigits: 2
    },
    {
        label: "Hong Kong Dollar HKD",
        value: "HKD",
        hasSymbol: "$",
        maxFractionalDigits: 2
    },
    {
        label: "Hungarian Forint HUF",
        value: "HUF",
        hasSymbol: "Ft",
        maxFractionalDigits: 2
    },
    {
        label: "Israeli New Shekel ILS",
        value: "ILS",
        hasSymbol: "₪",
        maxFractionalDigits: 2
    },
    {
        label: "Indian Rupee INR",
        value: "INR",
        hasSymbol: "₹",
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
    {
        label: "Sri Lankan Rupee LKR",
        value: "LKR",
        hasSymbol: "Rs",
        maxFractionalDigits: 2
    },
    {
        label: "Mexican Peso MXN",
        value: "MXN",
        hasSymbol: "$",
        maxFractionalDigits: 2
    },
    {
        label: "Malaysian Ringgit MYR",
        value: "MYR",
        hasSymbol: "RM",
        maxFractionalDigits: 2
    },
    {
        label: "Norwegian Krone NOK",
        value: "NOK",
        hasSymbol: "kr",
        maxFractionalDigits: 2
    },
    {
        label: "Nigerian Naira NGN",
        value: "NGN",
        hasSymbol: "₦",
        maxFractionalDigits: 2
    },
    {
        label: "New Zealand Dollar NZD",
        value: "NZD",
        hasSymbol: "$",
        maxFractionalDigits: 2
    },
    {
        label: "Philippine Peso PHP",
        value: "PHP",
        hasSymbol: "₱",
        maxFractionalDigits: 2
    },
    {
        label: "Pakistani Rupee PKR",
        value: "PKR",
        hasSymbol: "₨",
        maxFractionalDigits: 2
    },
    {
        label: "Polish Złoty PLN",
        value: "PLN",
        hasSymbol: "zł",
        maxFractionalDigits: 2
    },
    {
        label: "Russian Ruble RUB",
        value: "RUB",
        hasSymbol: "₽",
        maxFractionalDigits: 2
    },
    {
        label: "Saudi Riyal SAR",
        value: "SAR",
        hasSymbol: "SR",
        maxFractionalDigits: 2
    },
    {
        label: "Swedish Krona SEK",
        value: "SEK",
        hasSymbol: "kr",
        maxFractionalDigits: 2
    },
    {
        label: "Singapore Dollar SGD",
        value: "SGD",
        hasSymbol: "$",
        maxFractionalDigits: 2
    },
    {
        label: "Thai Baht THB",
        value: "THB",
        hasSymbol: "฿",
        maxFractionalDigits: 2
    },
    {
        label: "Turkish Lira TRY",
        value: "TRY",
        hasSymbol: "₺",
        maxFractionalDigits: 2
    },
    {
        label: "New Taiwan Dollar TWD",
        value: "TWD",
        hasSymbol: "NT$",
        maxFractionalDigits: 2
    },
    {
        label: "Ukrainian Hryvnia UAH",
        value: "UAH",
        hasSymbol: "₴",
        maxFractionalDigits: 2
    },
    {
        label: "Vietnamese Dong VND",
        value: "VND",
        hasSymbol: "₫",
        maxFractionalDigits: 0
    },
    {
        label: "South African Rand ZAR",
        value: "ZAR",
        hasSymbol: "R",
        maxFractionalDigits: 2
    }
];
