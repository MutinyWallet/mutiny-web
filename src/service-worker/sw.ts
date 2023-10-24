/// <reference lib="WebWorker" />
/// <reference types="vite/client" />

// SERVICE WORKER SETUP STUFF
// declare let self: ServiceWorkerGlobalScope

// ACTUAL LOGIC
console.log("hello from the service worker?");

// Receive push notifications
self.addEventListener("push", function (e) {
    console.log("push received");
    if (!(self.Notification && self.Notification.permission === "granted")) {
        //notifications aren't supported or permission not granted!
        console.log("nononono");
        return;
    }

    const hey = true;

    if (hey) {
        // let message = e.data.json();
        const message = {
            title: "Hello",
            body: "This is a notification",
            icon: "/favicon.ico",
            actions: [
                {
                    action: "open",
                    title: "Open the site",
                    icon: "/favicon.ico"
                }
            ]
        };
        console.log("about to wait until");
        e.waitUntil(
            self.registration.showNotification(message.title, {
                body: message.body,
                icon: message.icon,
                actions: message.actions
            })
        );
    }
});
