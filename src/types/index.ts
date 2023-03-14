export type WaitlistItem = {
    user_type: "nostr" | "email"
    id: string
    comment: string
    date: string
    approval_date: string
}