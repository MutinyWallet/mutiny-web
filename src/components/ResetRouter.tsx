import { Button, InnerCard, NiceP, VStack } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import {MutinyWallet} from "@mutinywallet/mutiny-wasm";

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('sw.ts').then(registration => {
//         console.log('Service Worker registered with scope:', registration.scope);
//     }).catch(error => {
//         console.error('Service Worker registration failed:', error);
//     });
// }

const WEBPUSH_PUBLIC_KEY = "BG0ZMyIMKsKbFJ3DwebtbJqt68O7Jn1NcppR1QQLMx3RC9HcMT-aF59VNIDPH8BRI6nmLlHuHLK1zaVADjHrv_M"

async function subscribeUserToPush() {
    console.log("waiting for service worker");
    const registration = await navigator.serviceWorker.ready;
    console.log("using push manager");
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(WEBPUSH_PUBLIC_KEY)
    });

    // const unsub = await registration.pushManager.getSubscription();
    // if (unsub) {
    //     await unsub.unsubscribe();
    // }

    
    console.log("talking to mutiny notification service");
    try {
        // Send the subscription to your server
        await MutinyWallet.test_register_web_push("https://auth-staging.mutinywallet.com", "http://localhost:8080", JSON.stringify(subscription));
        console.log("registered")
    } catch (e) {
        console.error(e)
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}


export function ResetRouter() {
    const i18n = useI18n();
    const [state, _] = useMegaStore();

    async function reset() {
        // Request notification permission from the user
        Notification.requestPermission().then(async permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
                await subscribeUserToPush();
                console.log('subscribed.');
            } else {
                console.error('Notification permission denied.');
            }
        });
    }

    return (
        <InnerCard>
            <VStack>
                <NiceP>{i18n.t("error.reset_router.payments_failing")}</NiceP>
                <Button intent="red" onClick={reset}>
                    {i18n.t("error.reset_router.reset_router")}
                </Button>
            </VStack>
        </InnerCard>
    );
}
