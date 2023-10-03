import { Capacitor } from "@capacitor/core";

// On mobile the origin URL is localhost, so we hardcode the base URL
export function baseUrlAccountingForNative(network?: string) {
    if (Capacitor.isNativePlatform()) {
        return network === "bitcoin"
            ? "https://app.mutinywallet.com"
            : "https://signet-app.mutinywallet.com";
    } else {
        return window.location.origin;
    }
}
