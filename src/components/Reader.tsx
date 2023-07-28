import { onCleanup, onMount } from "solid-js";
import {
    BarcodeScanner,
    BarcodeFormat,
    PermissionStates,
    ScanResult
} from "@mutinywallet/barcode-scanner";
import QrScanner from "qr-scanner";
import { Capacitor } from "@capacitor/core";

export default function Scanner(props: { onResult: (result: string) => void }) {
    let container: HTMLVideoElement | undefined;
    let scanner: QrScanner | undefined;

    const handleResult = ({ data }: { data: string }) => {
        props.onResult(data);
    };

    const startScan = async () => {
        // Check camera permission
        const permissions: PermissionStates =
            await BarcodeScanner.checkPermissions();
        if (permissions.camera === "granted") {
            const callback = (result: ScanResult, err?: unknown) => {
                if (err) {
                    console.error(err);
                    return;
                }
                // if the result has content
                if (result && result.content) {
                    handleResult({ data: result.content }); // pass the raw scanned content
                }
            };
            await BarcodeScanner.start(
                { formats: [BarcodeFormat.QR_CODE] },
                callback
            );
        } else if (permissions.camera === "prompt") {
            // Request permission if it has not been asked before
            const requestedPermissions: PermissionStates =
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

    const stopScan = () => {
        BarcodeScanner.stop();
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

    onCleanup(() => {
        if (Capacitor.isNativePlatform()) {
            stopScan();
        } else {
            scanner?.destroy();
        }
    });

    return (
        <>
            <div id="video-container">
                <video
                    ref={container}
                    class="w-full h-full fixed object-cover bg-transparent"
                />
            </div>
        </>
    );
}
