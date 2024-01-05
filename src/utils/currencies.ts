export interface Currency {
    value: string;
    label: string;
    hasSymbol?: string;
    maxFractionalDigits: number;
}

// When populating with new currencies it is recommended to get data from: https://www.xe.com/currency/usd-us-dollar/

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
        label: "Albanian Lek ALL",
        value: "ALL",
        hasSymbol: "Lek",
        maxFractionalDigits: 2
    },
    {
        label: "Dutch Guilder ANG",
        value: "ANG",
        hasSymbol: "ƒ",
        maxFractionalDigits: 2
    },
    {
        label: "Angolan Kwanza AOA",
        value: "AOA",
        hasSymbol: "Kz",
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
        label: "Azerbaijan Manat AZN",
        value: "AZN",
        hasSymbol: "₼",
        maxFractionalDigits: 2
    },
    {
        label: "Bangladeshi Taka BDT",
        value: "BDT",
        hasSymbol: "৳",
        maxFractionalDigits: 2
    },
    {
        label: "Bulgarian Lev BGN",
        value: "BGN",
        hasSymbol: "лв",
        maxFractionalDigits: 2
    },
    {
        label: "Bahraini Dinar BHD",
        value: "BHD",
        hasSymbol: "BD",
        maxFractionalDigits: 3
    },
    {
        label: "Burundian Franc BIF",
        value: "BIF",
        hasSymbol: "Franc",
        maxFractionalDigits: 2
    },
    {
        label: "Bermuda Dollar BMD",
        value: "BMD",
        hasSymbol: "$",
        maxFractionalDigits: 2
    },
    {
        label: "Bolivian Bolíviano BOB",
        value: "BOB",
        hasSymbol: "$b",
        maxFractionalDigits: 2
    },
    {
        label: "Brazilian Real BRL",
        value: "BRL",
        hasSymbol: "R$",
        maxFractionalDigits: 2
    },
    {
        label: "Botswana Pula BWP",
        value: "BWP",
        hasSymbol: "P",
        maxFractionalDigits: 2
    },
    {
        label: "Belarusian Ruble BYN",
        value: "BYN",
        hasSymbol: "p.",
        maxFractionalDigits: 2
    },
    {
        label: "Belizean Dollar BZD",
        value: "BZD",
        hasSymbol: "BZ$",
        maxFractionalDigits: 2
    },
    {
        label: "Canadian Dollar CAD",
        value: "CAD",
        hasSymbol: "$",
        maxFractionalDigits: 2
    },
    {
        label: "Congolese Franc CDF",
        value: "CDF",
        hasSymbol: "FC",
        maxFractionalDigits: 0
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
        label: "Colombian Peso COP",
        value: "COP",
        hasSymbol: "$",
        maxFractionalDigits: 2
    },
    {
        label: "Costa Rican Colon CRC",
        value: "CRC",
        hasSymbol: "₡",
        maxFractionalDigits: 2
    },
    {
        label: "Cuban Peso CUP",
        value: "CUP",
        hasSymbol: "₱",
        maxFractionalDigits: 2
    },
    {
        label: "Czech Koruna CZK",
        value: "CZK",
        hasSymbol: "Kč",
        maxFractionalDigits: 2
    },
    {
        label: "Djiboutian Franc DJF",
        value: "DJF",
        hasSymbol: "Franc",
        maxFractionalDigits: 0
    },
    {
        label: "Danish Krone DKK",
        value: "DKK",
        hasSymbol: "kr",
        maxFractionalDigits: 2
    },
    {
        label: "Dominican Peso DOP",
        value: "DOP",
        hasSymbol: "RD$",
        maxFractionalDigits: 2
    },
    {
        label: "Algerian Dinar DZD",
        value: "DZD",
        hasSymbol: "DA",
        maxFractionalDigits: 2
    },
    {
        label: "Egyptian Pound EGP",
        value: "EGP",
        hasSymbol: "£",
        maxFractionalDigits: 2
    },
    {
        label: "Ethiopian Birr ETP",
        value: "ETP",
        hasSymbol: "Br",
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
        label: "Georgian Lari GEL",
        value: "GEL",
        hasSymbol: "Lari",
        maxFractionalDigits: 2
    },
    {
        label: "Ghanaian Cedi GHS",
        value: "GHS",
        hasSymbol: "₵",
        maxFractionalDigits: 2
    },
    {
        label: "Guinean Franc GNF",
        value: "GNF",
        hasSymbol: "Franc",
        maxFractionalDigits: 2
    },
    {
        label: "Guatemalan Quetzal GTQ",
        value: "GTQ",
        hasSymbol: "Q",
        maxFractionalDigits: 2
    },
    {
        label: "Hong Kong Dollar HKD",
        value: "HKD",
        hasSymbol: "$",
        maxFractionalDigits: 2
    },
    {
        label: "Honduran Lempira HNL",
        value: "HNL",
        hasSymbol: "L",
        maxFractionalDigits: 2
    },
    {
        label: "Hungarian Forint HUF",
        value: "HUF",
        hasSymbol: "Ft",
        maxFractionalDigits: 2
    },
    {
        label: "Indonesian Rupiah IDR",
        value: "IDR",
        hasSymbol: "Rp",
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
        label: "Iranian Rial IRR",
        value: "IRR",
        hasSymbol: "﷼",
        maxFractionalDigits: 2
    },
    {
        label: "Iranian Toman IRT",
        value: "IRT",
        hasSymbol: "﷼",
        maxFractionalDigits: 2
    },
    {
        label: "Icelandic Krona ISK",
        value: "ISK",
        hasSymbol: "kr",
        maxFractionalDigits: 0
    },
    {
        label: "Jamaican Dollar JMD",
        value: "JMD",
        hasSymbol: "J$",
        maxFractionalDigits: 2
    },
    {
        label: "Jordanian Dinar JOD",
        value: "JOD",
        hasSymbol: "Dinar",
        maxFractionalDigits: 2
    },
    {
        label: "Japanese Yen JPY",
        value: "JPY",
        hasSymbol: "¥",
        maxFractionalDigits: 0
    },
    {
        label: "Kenyan Shilling KES",
        value: "KES",
        hasSymbol: "KSh",
        maxFractionalDigits: 2
    },
    {
        label: "Kyrgyzstani Som KGS",
        value: "KGS",
        hasSymbol: "лв",
        maxFractionalDigits: 0
    },
    {
        label: "Korean Won KRW",
        value: "KRW",
        hasSymbol: "₩",
        maxFractionalDigits: 0
    },
    {
        label: "Kazakhstani Tenge KZT",
        value: "KZT",
        hasSymbol: "₸",
        maxFractionalDigits: 2
    },
    {
        label: "Lebanese Pound LBP",
        value: "LBP",
        hasSymbol: "ل.ل",
        maxFractionalDigits: 2
    },
    {
        label: "Sri Lankan Rupee LKR",
        value: "LKR",
        hasSymbol: "Rs",
        maxFractionalDigits: 2
    },
    {
        label: "Moroccan Dirham MAD",
        value: "MAD",
        hasSymbol: "Dirham",
        maxFractionalDigits: 2
    },
    {
        label: "Malagasy Ariary MGA",
        value: "MGA",
        hasSymbol: "Ar",
        maxFractionalDigits: 1
    },
    {
        label: "Cuban Peso MLC",
        value: "MLC",
        maxFractionalDigits: 2
    },
    {
        label: "Mauritanian Ouguiya MRU",
        value: "MRU",
        hasSymbol: "UM",
        maxFractionalDigits: 1
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
        label: "Namibian Dollar NAD",
        value: "NAD",
        hasSymbol: "$",
        maxFractionalDigits: 2
    },
    {
        label: "Nigerian Naira NGN",
        value: "NGN",
        hasSymbol: "₦",
        maxFractionalDigits: 2
    },
    {
        label: "Nicaraguan Cordoba NIO",
        value: "NIO",
        hasSymbol: "C$",
        maxFractionalDigits: 2
    },
    {
        label: "Norwegian Krone NOK",
        value: "NOK",
        hasSymbol: "kr",
        maxFractionalDigits: 2
    },
    {
        label: "Nepalese Rupee NPR",
        value: "NPR",
        hasSymbol: "₨",
        maxFractionalDigits: 2
    },
    {
        label: "New Zealand Dollar NZD",
        value: "NZD",
        hasSymbol: "$",
        maxFractionalDigits: 2
    },
    {
        label: "Panamanian Balboa PAB",
        value: "PAB",
        hasSymbol: "B/.",
        maxFractionalDigits: 2
    },
    {
        label: "Peruvian Sol PEN",
        value: "PEN",
        hasSymbol: "S/.",
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
        label: "Paraguayan Guarani PYG",
        value: "PYG",
        hasSymbol: "Gs",
        maxFractionalDigits: 2
    },
    {
        label: "Qatari Riyal QAR",
        value: "QAR",
        hasSymbol: "﷼",
        maxFractionalDigits: 2
    },
    {
        label: "Romanian Leu RON",
        value: "RON",
        hasSymbol: "lei",
        maxFractionalDigits: 2
    },
    {
        label: "Serbian Dinar RSD",
        value: "RSD",
        hasSymbol: "РСД",
        maxFractionalDigits: 2
    },
    {
        label: "Russian Ruble RUB",
        value: "RUB",
        hasSymbol: "₽",
        maxFractionalDigits: 2
    },
    {
        label: "Rwandan Franc RWF",
        value: "RWF",
        hasSymbol: "Franc",
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
        label: "Tunisian Dinar TND",
        value: "TND",
        hasSymbol: "Dinar",
        maxFractionalDigits: 0
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
        label: "Tanzanian Shilling TZS",
        value: "TZS",
        hasSymbol: "Shilling",
        maxFractionalDigits: 2
    },
    {
        label: "Ukrainian Hryvnia UAH",
        value: "UAH",
        hasSymbol: "₴",
        maxFractionalDigits: 2
    },
    {
        label: "Ugandan Shilling UGX",
        value: "UGX",
        maxFractionalDigits: 0
    },
    {
        label: "Uruguayan Peso UYU",
        value: "UYU",
        hasSymbol: "$U",
        maxFractionalDigits: 2
    },
    {
        label: "Uzbekistani Som UZS",
        value: "UZS",
        hasSymbol: "лв",
        maxFractionalDigits: 2
    },
    {
        label: "Venezuelan Bolívar VES",
        value: "VES",
        hasSymbol: "Bs",
        maxFractionalDigits: 2
    },
    {
        label: "Vietnamese Dong VND",
        value: "VND",
        hasSymbol: "₫",
        maxFractionalDigits: 0
    },
    {
        label: "Central African CFA Franc BEAC XAF",
        value: "XAF",
        hasSymbol: "FCFA",
        maxFractionalDigits: 2
    },
    {
        label: "Silver Ounce XAG",
        value: "XAG",
        hasSymbol: "Oz",
        maxFractionalDigits: 6
    },
    {
        label: "Gold Ounce XAU",
        value: "XAU",
        hasSymbol: "Oz",
        maxFractionalDigits: 6
    },
    {
        label: "CFA Franc XOF",
        value: "XOF",
        hasSymbol: "FCFA",
        maxFractionalDigits: 2
    },
    {
        label: "Platinum Ounce XPT",
        value: "XPT",
        hasSymbol: "Oz",
        maxFractionalDigits: 6
    },
    {
        label: "South African Rand ZAR",
        value: "ZAR",
        hasSymbol: "R",
        maxFractionalDigits: 2
    }
];
