export default function getHostname(url: string): string {
    // Check if the URL begins with "ws://" or "wss://"
    if (url.startsWith("ws://")) {
        // If it does, remove "ws://" from the URL
        url = url.slice(5);
    } else if (url.startsWith("wss://")) {
        // If it begins with "wss://", remove "wss://" from the URL
        url = url.slice(6);
    }

    // Return the resulting URL
    return url;
}
