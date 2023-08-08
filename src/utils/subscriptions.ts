const GRACE = 60 * 60 * 24 * 3; // 3 days

export function subscriptionValid(subscriptionExpiresTimestamp?: number) {
    if (!subscriptionExpiresTimestamp) return false;

    return subscriptionExpiresTimestamp + GRACE > Math.ceil(Date.now() / 1000);
}
