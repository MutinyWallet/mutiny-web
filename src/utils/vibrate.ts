import { Haptics } from "@capacitor/haptics";
import { NotificationType } from "@capacitor/haptics/dist/esm/definitions";

export const vibrateSuccess = async () => {
    try {
        await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
        console.warn(error);
    }
};
