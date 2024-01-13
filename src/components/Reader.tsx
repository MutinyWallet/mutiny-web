import {
    BarcodeFormat,
    BarcodeScannedEvent,
    BarcodeScanner,
    PermissionStatus
} from "@capacitor-mlkit/barcode-scanning";
import { Capacitor } from "@capacitor/core";
import QrScanner from "qr-scanner";
import { onCleanup, onMount } from "solid-js";

export function Reader(props: { onResult: (result: string) => void }) {
    let container: HTMLVideoElement | undefined;
    let scanner: QrScanner | undefined;

    const handleResult = ({ data }: { data: string }) => {
        props.onResult(data);
    };

    const startScan = async () => {
        // Check camera permission
        const permissions: PermissionStatus =
            await BarcodeScanner.checkPermissions();
        if (permissions.camera === "granted") {
            await BarcodeScanner.startScan({ formats: [BarcodeFormat.QrCode] });

            // The camera gets mounted behind everything so we need to make the background transparent
            document.querySelector("html")?.classList.add("bg-transparent");

            const listener = await BarcodeScanner.addListener(
                "barcodeScanned",
                // eslint-disable-next-line
                async (result: BarcodeScannedEvent) => {
                    document
                        .querySelector("html")
                        ?.classList.remove("bg-transparent");

                    await BarcodeScanner.stopScan();
                    await listener.remove();

                    // if the result has content
                    if (result && result.barcode) {
                        handleResult({ data: result.barcode.rawValue }); // pass the raw scanned content
                    }
                }
            );
        } else if (permissions.camera === "prompt") {
            // Request permission if it has not been asked before
            const requestedPermissions: PermissionStatus =
                await BarcodeScanner.requestPermissions();
            if (requestedPermissions.camera === "granted") {
                // If user grants permission, start the scan
                await startScan();
            }
        } else if (permissions.camera === "denied") {
            // Handle the scenario when user denies the permission
            // Maybe show a user friendly message here
            console.log("Camera permission was denied");
        }
    };

    const stopScan = async () => {
        // Restore the background first to minimize flicker
        document.querySelector("html")?.classList.remove("bg-transparent");
        await BarcodeScanner.stopScan();
        await BarcodeScanner.removeAllListeners();
    };

    onMount(async () => {
        if (Capacitor.isNativePlatform()) {
            await startScan();
        } else {
            if (container) {
                scanner = new QrScanner(container, handleResult, {
                    returnDetailedScanResult: true
                });
                await scanner.start();
            }
        }
    });

    onCleanup(async () => {
        if (Capacitor.isNativePlatform()) {
            await stopScan();
        } else {
            scanner?.destroy();
        }
    });

    return (
        <>
            <div id="video-container">
                <video
                    ref={container}
                    class="fixed h-full w-full bg-transparent object-cover"
                />
            </div>
        </>
    );
}
