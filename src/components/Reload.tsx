import type { Component } from "solid-js";
import { Show } from "solid-js";
// eslint-disable-next-line import/no-unresolved
import { useRegisterSW } from "virtual:pwa-register/solid";

const ReloadPrompt: Component = () => {
    const {
        offlineReady: [offlineReady, _setOfflineReady],
        needRefresh: [needRefresh, _setNeedRefresh],
        updateServiceWorker: _update
    } = useRegisterSW({
        immediate: true,
        onRegisteredSW(swUrl, r) {
            console.log("SW Registered: " + r?.scope);
        },
        onRegisterError(error: Error) {
            console.log("SW registration error", error);
        }
    });

    // const close = () => {
    //     setOfflineReady(false)
    //     setNeedRefresh(false)
    // }

    return (
        <Show when={offlineReady() || needRefresh()}>
            {/* <Card title="PWA settings">
                <div>
                    <Show
                        fallback={<span>New content available, click on reload button to update.</span>}
                        when={offlineReady()}
                    >
                        <span>App ready to work offline</span>
                    </Show>
                </div>
                <Show when={needRefresh()}>
                    <Button onClick={() => updateServiceWorker(true)}>Reload</Button>
                </Show>
                <Button onClick={() => close()}>Close</Button>
            </Card> */}
        </Show>
    );
};

export default ReloadPrompt;
