import { Capacitor } from "@capacitor/core";
import { AppLauncher } from '@capacitor/app-launcher';

export async function openLinkProgrammatically(url?: string) {
    if (!url) return;
    if (Capacitor.isNativePlatform()) {
        const { value } = await AppLauncher.canOpenUrl({ url });

        if (!value) {
            // Try to open in browser just in case that works glhf
            window.open(url || "", "_blank");
            return;
        } else {
            await AppLauncher.openUrl({ url});
        }
    } else {
        window.open(url || "", "_blank");
    }
}
