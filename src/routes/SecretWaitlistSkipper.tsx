import button from "@/styles/button";
import { useState } from "react";

export default function SecretWaitlistSkipper() {
    const [active] = useState(localStorage.getItem('active') || "");

    function toggleSkipWaitlist() {
        // If active in localstorage is true, set to false, otherwie set to true
        if (active === "true") {
            localStorage.setItem("active", "false");
        } else {
            localStorage.setItem("active", "true");
        }

        // Redirect to index
        window.location.href = "/";
    }
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center">
            <div className="flex-0">
                {active === "true" &&
                    <button className={button({ intent: "active" })} onClick={toggleSkipWaitlist}><span className="drop-shadow-sm shadow-black">I love waiting, hate cheating</span></button>
                }
                {active !== "true" &&
                    <button className={button({ intent: "active" })} onClick={toggleSkipWaitlist}><span className="drop-shadow-sm shadow-black">I hate waiting, love cheating</span></button>
                }
            </div>
        </div>
    )
}