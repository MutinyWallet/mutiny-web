import { AppLauncher } from "@capacitor/app-launcher";
import { Capacitor } from "@capacitor/core";

import { showToast, ToastArg } from "~/components";

// Have to pass in the failure text because i18n doesn't work in utils
export async function openLinkProgrammatically(
    url?: string,
    failureText?: ToastArg
) {
    if (!url) return;
    if (Capacitor.isNativePlatform()) {
        const { value } = await AppLauncher.canOpenUrl({ url });

        if (!value) {
            showToast(
                failureText || {
                    title: "Client not found",
                    description:
                        "Please install a compatible client to open this link."
                }
            );
            // Try to open in browser just in case that works glhf
            window.open(url || "", "_blank");
            return;
        } else {
            await AppLauncher.openUrl({ url });
        }
    } else {
        window.open(url || "", "_blank");
    }
}
