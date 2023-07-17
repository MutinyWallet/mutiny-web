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

export function timeAgo(ts?: number | bigint): string {
    if (!ts || ts === 0) return "Pending";
    const timestamp = Number(ts) * 1000;
    const now = Date.now();
    const negative = now - timestamp < 0;
    const nowOrAgo = negative ? "from now" : "ago";
    const elapsedMilliseconds = Math.abs(now - timestamp);
    const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    const elapsedDays = Math.floor(elapsedHours / 24);

    if (elapsedSeconds < 60) {
        return negative ? "seconds from now" : "Just now";
    } else if (elapsedMinutes < 60) {
        return `${elapsedMinutes} minute${
            elapsedMinutes > 1 ? "s" : ""
        } ${nowOrAgo}`;
    } else if (elapsedHours < 24) {
        return `${elapsedHours} hour${elapsedHours > 1 ? "s" : ""} ${nowOrAgo}`;
    } else if (elapsedDays < 7) {
        return `${elapsedDays} day${elapsedDays > 1 ? "s" : ""} ${nowOrAgo}`;
    } else {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }
}

export function formatExpiration(expiration?: bigint) {
    if (!expiration) {
        return "Unknown expiration";
    }

    if (expiration <= Date.now() / 1000) {
        return "Expired";
    }

    return `Expires ${timeAgo(expiration)}`;
}
