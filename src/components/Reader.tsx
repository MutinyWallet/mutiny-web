import QrScanner from 'qr-scanner';
import { useEffect, useRef } from "react";

export default function Scanner({ onResult }: { onResult: (result: string) => void }) {
    const container = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        let scanner: QrScanner | null;
        if (container.current) {
            scanner = new QrScanner(
                container.current,
                (result) => {
                    onResult(result.data);
                },
                {
                    returnDetailedScanResult: true,

                }
            );

            scanner.start();
        }

        return () => {
            scanner?.destroy();
            scanner = null;
        }
    }, [onResult]);

    return (
        <>
            <div id="video-container">
                <video ref={container} className="w-full h-full fixed object-cover bg-gray"></video>
            </div>
        </>
    );
}
