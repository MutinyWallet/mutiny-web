import { useNavigate } from "react-router-dom";
import button from "@/styles/button";

import { useState } from "react";
import Reader from "@/components/Reader";

export default function Scanner() {
    const navigate = useNavigate();

    const [scanResult, setScanResult] = useState<string | null>(null);

    function onResult(result: string) {
        setScanResult(result);
    }

    function exit() {
        navigate("/")
    }

    return (
        <>
            {scanResult ?
                <div className="w-full p-8">
                    <div className="mt-[20vw] rounded-xl p-4 flex flex-col gap-2 bg-[rgba(0,0,0,0.5)]">
                        <header className='text-sm font-semibold uppercase'>
                            Scan Result
                        </header>
                        <code className="break-all">{scanResult}</code>
                    </div>
                </div> : <Reader onResult={onResult} />
            }
            <div className="w-full flex flex-col fixed bottom-[2rem] gap-8 px-8">
                {!scanResult &&
                    <>
                        <button className={button({ intent: "blue" })} onClick={exit}>Paste Something</button>
                        <button className={button()} onClick={exit}>Cancel</button>
                    </>
                }
                {scanResult &&
                    <>
                        <button className={button({ intent: "red" })} onClick={() => setScanResult(null)}>Try Again</button>
                        <button className={button()} onClick={exit}>Cancel</button>
                    </>
                }
            </div>
        </>
    );
}