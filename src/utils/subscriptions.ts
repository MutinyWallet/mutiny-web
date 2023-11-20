const GRACE = 60 * 60 * 24 * 3; // 3 days

export function subscriptionValid(subscriptionExpiresTimestamp?: number) {
    if (!subscriptionExpiresTimestamp) return false;

    return subscriptionExpiresTimestamp + GRACE > Math.ceil(Date.now() / 1000);
}

export function isFreeGiftingDay() {
    const today = new Date();
    // days are 1 indexed, months are 0 indexed
    const isChristmas = today.getDate() === 25 && today.getMonth() === 11;

    return isChristmas || isThanksgiving(today);
}

function isThanksgiving(today: Date) {
    if (today.getMonth() !== 10) return false;

    const year = today.getFullYear();
    const thanksgivingDay = new Date(year, 10, 1);

    // Find out what day of the week Nov 1 is
    const dayOfWeek = thanksgivingDay.getDay();

    // Calculate the date of the fourth Thursday in November
    thanksgivingDay.setDate(1 + ((4 - dayOfWeek) % 7) + 3 * 7);

    // Compare the current date with Thanksgiving date
    return today.getDate() === thanksgivingDay.getDate();
}
