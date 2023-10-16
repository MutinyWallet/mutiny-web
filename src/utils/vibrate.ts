import { Capacitor } from "@capacitor/core";
import { Haptics } from "@capacitor/haptics";
import { NotificationType } from "@capacitor/haptics/dist/esm/definitions";

export const vibrate = async (millis = 250) => {
    if (Capacitor.isNativePlatform()) {
        await Haptics.vibrate({ duration: millis });
    } else {
        window.navigator.vibrate(millis);
    }
};

export const vibrateSuccess = async () => {
    if (Capacitor.isNativePlatform()) {
        await Haptics.notification({ type: NotificationType.Success });
    } else {
        window.navigator.vibrate([35, 65, 21]);
    }
};
