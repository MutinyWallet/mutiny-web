import QrScanner from "qr-scanner";
import { onCleanup, onMount } from "solid-js";

export default function Scanner(props: { onResult: (result: string) => void }) {
    let container: HTMLVideoElement | undefined;
    let scanner: QrScanner | undefined;

    const handleResult = ({ data }: { data: string }) => {
        props.onResult(data);
    };

    onMount(async () => {
        if (container) {
            scanner = new QrScanner(container, handleResult, {
                returnDetailedScanResult: true
            });
            await scanner.start();
        }
    });

    onCleanup(() => {
        scanner?.destroy();
    });

    return (
        <>
            <div id="video-container">
                <video
                    ref={container}
                    class="w-full h-full fixed object-cover bg-gray"
                />
            </div>
        </>
    );
}
