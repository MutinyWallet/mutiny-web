import QrScanner from 'qr-scanner';
import { createSignal, onCleanup, onMount } from 'solid-js';

export default function Scanner(props: { onResult: (result: string) => void }) {
    let container: HTMLVideoElement | null;

    // TODO: not sure it's appropriate to use a signal for this but it works!
    const [scanner, setScanner] = createSignal<QrScanner | null>(null);

    const handleResult = (result: { data: string }) => {
        props.onResult(result.data);
    }

    onMount(() => {
        if (container) {
            const newScanner = new QrScanner(
                container,
                handleResult,
                {
                    returnDetailedScanResult: true,
                }
            );
            newScanner.start();
            setScanner(newScanner)
        }
    });

    onCleanup(() => {
        scanner()?.destroy();
        setScanner(null);
        container = null;
    });

    return (
        <>
            <div id="video-container">
                <video ref={el => container = el} class="w-full h-full fixed object-cover bg-gray" />
            </div>
        </>
    );
}
