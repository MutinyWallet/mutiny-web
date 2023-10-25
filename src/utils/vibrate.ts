import { Haptics } from "@capacitor/haptics";
import { NotificationType } from "@capacitor/haptics/dist/esm/definitions";

export const vibrate = async (millis = 250) => {
    try {
        await Haptics.vibrate({ duration: millis });
    } catch (error) {
        console.warn(error);
    }
};

export const vibrateSuccess = async () => {
    try {
        await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
        console.warn(error);
    }
};
