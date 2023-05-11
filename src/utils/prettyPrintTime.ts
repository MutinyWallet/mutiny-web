export function prettyPrintTime(ts: number) {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    };

    return new Date(ts * 1000).toLocaleString('en-US', options);
}

export function timeAgo(ts?: number | bigint): string {
    if (!ts || ts === 0) return "Pending";
    const timestamp = Number(ts) * 1000;
    const now = Date.now();
    const elapsedMilliseconds = now - timestamp;
    const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    const elapsedDays = Math.floor(elapsedHours / 24);

    if (elapsedSeconds < 60) {
        return "Just now";
    } else if (elapsedMinutes < 60) {
        return `${elapsedMinutes} minute${elapsedMinutes > 1 ? 's' : ''} ago`;
    } else if (elapsedHours < 24) {
        return `${elapsedHours} hour${elapsedHours > 1 ? 's' : ''} ago`;
    } else if (elapsedDays < 7) {
        return `${elapsedDays} day${elapsedDays > 1 ? 's' : ''} ago`;
    } else {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }
}
