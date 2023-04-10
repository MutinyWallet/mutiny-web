import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { useRegisterSW } from 'virtual:pwa-register/solid'
import Card from './Card'
import { Button } from './Button'

const ReloadPrompt: Component = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: ServiceWorkerRegistration) {
            console.log('SW Registered: ' + r.scope)
        },
        onRegisterError(error: Error) {
            console.log('SW registration error', error)
        },
    })

    const close = () => {
        setOfflineReady(false)
        setNeedRefresh(false)
    }

    return (
        <Show when={offlineReady() || needRefresh()}>
            <Card title="PWA settings">
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
            </Card>
        </Show>
    )
}

export default ReloadPrompt