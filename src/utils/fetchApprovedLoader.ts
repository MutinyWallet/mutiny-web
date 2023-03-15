import { WaitlistItem } from "@/types";

export async function fetchApprovedStatus(waitlistId: string): Promise<WaitlistItem | null> {
    // Fetch the waitlist status from the backend
    // Will error if it doesn't exist so we just return undefined
    try {
        let res = await fetch(`https://waitlist.mutiny-waitlist.workers.dev/waitlist/${waitlistId}`)
        let data = await res.json();
        return data
    } catch (e) {
        console.error(e)
        return null
    }
} 