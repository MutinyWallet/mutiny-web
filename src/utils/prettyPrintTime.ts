import { useI18n } from "~/i18n/context";

export function prettyPrintTime(ts: number) {
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
    };

    return new Date(ts * 1000).toLocaleString("en-US", options);
}

// Rerender signal is a silly way to force timeAgo to recalculate even though the timestamp is static
export function timeAgo(
    ts?: number | bigint,
    _rerenderSignal?: number
): string {
    const i18n = useI18n();

    if (!ts || ts === 0) return i18n.t("common.pending");
    const timestamp = Number(ts) * 1000;
    const now = Date.now();
    const tense = now - timestamp < 0 ? "future" : "past";
    const elapsedMilliseconds = Math.abs(now - timestamp);
    const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    const elapsedDays = Math.floor(elapsedHours / 24);

    if (elapsedSeconds < 60) {
        return i18n.t(`utils.seconds_${tense}`);
    } else if (elapsedMinutes < 60) {
        return i18n.t(`utils.minutes_${tense}`, { count: elapsedMinutes });
    } else if (elapsedHours < 24) {
        return i18n.t(`utils.hours_${tense}`, { count: elapsedHours });
    } else if (elapsedDays < 7) {
        return i18n.t(`utils.days_${tense}`, { count: elapsedDays });
    } else {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }
}

export function veryShortTimeStamp(ts?: number | bigint) {
    const i18n = useI18n();

    if (!ts || ts === 0) return i18n.t("common.pending");
    const timestamp = Number(ts) * 1000;
    const now = Date.now();
    const elapsedMilliseconds = Math.abs(now - timestamp);
    const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    const elapsedDays = Math.floor(elapsedHours / 24);

    if (elapsedSeconds < 60) {
        return i18n.t("utils.nowish");
    } else if (elapsedMinutes < 60) {
        return i18n.t("utils.minutes_short", { count: elapsedMinutes });
    } else if (elapsedHours < 24) {
        return i18n.t("utils.hours_short", { count: elapsedHours });
    } else if (elapsedDays < 7) {
        return i18n.t("utils.days_short", { count: elapsedDays });
    } else {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }
}
