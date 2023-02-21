import { useEffect, useState } from "react";
import WaitlistForm from "@/components/WaitlistForm";
import { WaitlistAlreadyIn } from "@/components/WaitlistAlreadyIn";

export default function Join() {
    // On load, check if the user is already on the waitlist
    const [waitlisted, setWaitlisted] = useState(false);
    const [waitlistId] = useState(localStorage.getItem('waitlist_id') || "");
    const [loading, setLoading] = useState(true);

    // Fetch the waitlist status from the backend
    useEffect(() => {
        if (waitlistId) {
            fetch(`https://waitlist.mutiny-waitlist.workers.dev/waitlist/${waitlistId}`).then(res => {
                if (res.status === 200) {
                    setWaitlisted(true);
                }
                setLoading(false);
            })
        } else {
            setLoading(false);
        }
    }, [waitlistId]);

    return (
        <>
            {loading ? null : waitlisted ? <WaitlistAlreadyIn /> : <WaitlistForm />}
        </>
    )
}

