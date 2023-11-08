import { MutinyWallet } from "@mutinywallet/mutiny-wasm";

import { Currency } from "./currencies";

/** satsToFiat
 *  returns a toLocaleString() based on the bitcoin price in the chosen currency
 *  @param {number} amount - Takes a number as a string to parse the formatted value
 *  @param {number} price - Finds the Price from the megaStore state
 *  @param {Currency} fiat - Takes {@link Currency} object options to determine how to format the amount input
 */

export function satsToFiat(
    amount: number | undefined,
    price: number,
    fiat: Currency
): string {
    if (typeof amount !== "number" || isNaN(amount)) {
        return "";
    }
    try {
        const btc = MutinyWallet.convert_sats_to_btc(
            BigInt(Math.floor(amount))
        );
        const fiatPrice = btc * price;
        const roundedFiat = Math.round(fiatPrice);
        if (
            (fiat.value !== "BTC" &&
                roundedFiat * 100 === Math.round(fiatPrice * 100)) ||
            fiatPrice === 0
        ) {
            return fiatPrice.toFixed(0);
        } else {
            return fiatPrice.toFixed(fiat.maxFractionalDigits);
        }
    } catch (e) {
        console.error(e);
        return "";
    }
}

/** satsToFormattedFiat
 *  returns a toLocaleString() based on the bitcoin price in the chosen currency with its appropriate currency prefix
 *  @param {number} amount - Takes a number as a string to parse the formatted value
 *  @param {number} price - Finds the Price from the megaStore state
 *  @param {Currency} fiat - Takes {@link Currency} object options to determine how to format the amount input
 */

export function satsToFormattedFiat(
    amount: number | undefined,
    price: number,
    fiat: Currency
): string {
    if (typeof amount !== "number" || isNaN(amount)) {
        return "";
    }
    try {
        const btc = MutinyWallet.convert_sats_to_btc(
            BigInt(Math.floor(amount))
        );
        const fiatPrice = btc * price;
        //Handles currencies not supported by .toLocaleString() like BTC
        //Returns a string with a currency symbol and a number with decimals equal to the maxFractionalDigits
        if (fiat.hasSymbol) {
            return (
                fiat.hasSymbol +
                fiatPrice.toLocaleString(navigator.languages[0] || "en-US", {
                    minimumFractionDigits:
                        fiatPrice === 0 ? 0 : fiat.maxFractionalDigits,
                    maximumFractionDigits: fiat.maxFractionalDigits
                })
            );
            //Handles currencies with no symbol only an ISO code
        } else {
            return fiatPrice.toLocaleString(navigator.languages[0], {
                minimumFractionDigits:
                    fiatPrice === 0 ? 0 : fiat.maxFractionalDigits
            });
        }
    } catch (e) {
        console.error(e);
        return "";
    }
}

export function fiatToSats(
    amount: number | undefined,
    price: number,
    formatted: boolean
): string {
    if (typeof amount !== "number" || isNaN(amount)) {
        return "";
    }
    try {
        const btc = price / amount;
        const sats = MutinyWallet.convert_btc_to_sats(btc);
        if (formatted) {
            return parseInt(sats.toString()).toLocaleString();
        } else {
            return sats.toString();
        }
    } catch (e) {
        console.error(e);
        return "";
    }
}
