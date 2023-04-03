import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import { useRegisterSW } from 'virtual:pwa-register/solid'

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

    // TODO: for now we're just going to have it be invisible
    return (<></>)

    // return (
    //     <div>
    //         <Show when={offlineReady() || needRefresh()}>
    //             <div>
    //                 <div>
    //                     <Show
    //                         fallback={<span>New content available, click on reload button to update.</span>}
    //                         when={offlineReady()}
    //                     >
    //                         <span>App ready to work offline</span>
    //                     </Show>
    //                 </div>
    //                 <Show when={needRefresh()}>
    //                     <button onClick={() => updateServiceWorker(true)}>Reload</button>
    //                 </Show>
    //                 <button onClick={() => close()}>Close</button>
    //             </div>
    //         </Show>
    //     </div>
    // )
}

export default ReloadPrompt