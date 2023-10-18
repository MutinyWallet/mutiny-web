import { Capacitor } from "@capacitor/core";
import { Haptics } from "@capacitor/haptics";
import { NotificationType, ImpactStyle } from "@capacitor/haptics/dist/esm/definitions";

export const impact = async () => {
    if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light})
    } else {
        window.navigator.vibrate(35);
    }
};

export const vibrate = async (millis: number[]) => {
    if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light})
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
