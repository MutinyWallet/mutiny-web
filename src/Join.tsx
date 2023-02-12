import { useEffect, useState } from "react";
import { redirect } from "react-router-dom";
import button from "./components/button"
import WaitlistForm from "./components/WaitlistForm";
import { WaitlistAlreadyIn } from "./components/WaitlistAlreadyIn";

export default function Join() {
    // On load, check if the user is already on the waitlist
    const [waitlisted, setWaitlisted] = useState(false);
    const [waitlistId, setWaitlistId] = useState(localStorage.getItem('waitlist_id') || "");
    const [loading, setLoading] = useState(true);

    // Fetch the waitlist status from the backend
    useEffect(() => {
        if (waitlistId) {
            fetch(`https://waitlist.mutiny-waitlist.workers.dev/waitlist${waitlistId}`).then(res => {
                if (res.status === 200) {
                    setWaitlisted(true);
                }

            })
        }
        setLoading(false);
    }, [waitlistId]);

    return (
        <div className="safe-top safe-left safe-right safe-bottom">
            <div className="disable-scrollbars max-h-screen h-full overflow-y-scroll mx-4">
                {waitlisted && !loading ? <WaitlistAlreadyIn /> : !loading ? <WaitlistForm /> : null}
            </div>
        </div >
    )
}

