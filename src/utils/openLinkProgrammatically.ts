import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

// Safari is a jerk and is aggressive about blocking window.open calls if the logic is too complex
// Capacitor should be doing this for us but \o/
export function openLinkProgrammatically(href?: string) {
    if (!href) return;
    if (Capacitor.isNativePlatform()) {
        Browser.open({ url: href || "", windowName: "_blank" });
    } else {
        window.open(href || "", "_blank");
    }
}
