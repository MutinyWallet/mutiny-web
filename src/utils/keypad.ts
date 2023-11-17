import { Currency } from "./currencies";

// Checks the users locale to determine if decimals should be a "." or a ","
const decimalDigitDivider = Number(1.0)
    .toLocaleString(navigator.languages[0], { minimumFractionDigits: 1 })
    .substring(1, 2);

export function toDisplayHandleNaN(
    input?: string | bigint,
    fiat?: Currency
): string {
    if (!input) {
        return "0";
    }

    if (typeof input === "bigint") {
        console.error("toDisplayHandleNaN: input is a bigint", input);
    }

    const inputStr = input.toString();

    const parsed = Number(input);

    //handle decimals so the user can always see the accurate amount
    if (isNaN(parsed)) {
        return "0";
    } else if (parsed === Math.trunc(parsed) && inputStr.endsWith(".")) {
        return (
            parsed.toLocaleString(navigator.languages[0]) + decimalDigitDivider
        );
        /* To avoid having logic to handle every number up to 8 decimals 
        any custom currency pair that has more than 3 decimals will always show all decimals*/
    } else if (fiat?.maxFractionalDigits && fiat.maxFractionalDigits > 3) {
        return parsed.toLocaleString(navigator.languages[0], {
            minimumFractionDigits: parsed === 0 ? 0 : fiat.maxFractionalDigits,
            maximumFractionDigits: fiat.maxFractionalDigits
        });
    } else if (parsed === Math.trunc(parsed) && inputStr.endsWith(".0")) {
        return parsed.toLocaleString(navigator.languages[0], {
            minimumFractionDigits: 1
        });
    } else if (parsed === Math.trunc(parsed) && inputStr.endsWith(".00")) {
        return parsed.toLocaleString(navigator.languages[0], {
            minimumFractionDigits: 2
        });
    } else if (parsed === Math.trunc(parsed) && inputStr.endsWith(".000")) {
        return parsed.toLocaleString(navigator.languages[0], {
            minimumFractionDigits: 3
        });
    } else if (
        parsed !== Math.trunc(parsed) &&
        // matches strings that have 3 total digits after the decimal and ends with 0
        inputStr.match(/\.\d{2}0$/) &&
        inputStr.includes(".", inputStr.length - 4)
    ) {
        return parsed.toLocaleString(navigator.languages[0], {
            minimumFractionDigits: 3
        });
    } else if (
        parsed !== Math.trunc(parsed) &&
        // matches strings that have 2 total digits after the decimal and ends with 0
        inputStr.match(/\.\d{1}0$/) &&
        inputStr.includes(".", inputStr.length - 3)
    ) {
        return parsed.toLocaleString(navigator.languages[0], {
            minimumFractionDigits: 2
        });
    } else {
        return parsed.toLocaleString(navigator.languages[0], {
            maximumFractionDigits: 3
        });
    }
}

export function fiatInputSanitizer(input: string, maxDecimals: number): string {
    // Make sure only numbers and a single decimal point are allowed if decimals are allowed
    let allowDecimalRegex;
    if (maxDecimals !== 0) {
        allowDecimalRegex = new RegExp("[^0-9.]", "g");
    } else {
        allowDecimalRegex = new RegExp("[^0-9]", "g");
    }
    const numeric = input
        .replace(allowDecimalRegex, "")
        .replace(/(\..*)\./g, "$1");

    // Remove leading zeros if not a decimal, add 0 if starts with a decimal
    const cleaned = numeric.replace(/^0([^.]|$)/g, "$1").replace(/^\./g, "0.");

    // If there are more characters after the decimal than allowed, shift the decimal
    const shiftRegex = new RegExp(
        "(\\.[0-9]{" + (maxDecimals + 1) + "}).*",
        "g"
    );
    const shifted = cleaned.match(shiftRegex)
        ? (parseFloat(cleaned) * 10).toFixed(maxDecimals)
        : cleaned;

    // Truncate any numbers past the maxDecimal for the currency
    const decimalRegex = new RegExp("(\\.[0-9]{" + maxDecimals + "}).*", "g");
    const decimals = shifted.replace(decimalRegex, "$1");

    return decimals;
}

export function satsInputSanitizer(input: string): string {
    // Make sure only numbers are allowed
    const numeric = input.replace(/[^0-9]/g, "");
    // If it starts with a 0, remove the 0
    const noLeadingZero = numeric.replace(/^0([^.]|$)/g, "$1");

    return noLeadingZero;
}

export function btcFloatRounding(localValue: string): string {
    return (
        (parseFloat(localValue) -
            parseFloat(localValue.charAt(localValue.length - 1)) / 100000000) /
        10
    ).toFixed(8);
}
