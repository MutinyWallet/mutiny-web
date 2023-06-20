import type { Component } from "solid-js";
import { Show } from "solid-js";
// eslint-disable-next-line import/no-unresolved
import { useRegisterSW } from "virtual:pwa-register/solid";
import { Button } from "./layout/Button";
import { SmallHeader } from "./layout";
import refresh from "~/assets/icons/refresh.svg";
import close from "~/assets/icons/close.svg";

const ReloadPrompt: Component = () => {
    // useRegisterSW can also return an offlineReady thingy
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker
    } = useRegisterSW({
        immediate: true,
        onRegisteredSW(swUrl, r) {
            console.log("SW Registered: " + r?.scope);
        },
        onRegisterError(error: Error) {
            console.log("SW registration error", error);
        }
    });

    const dismissPrompt = () => {
        setNeedRefresh(false);
    };

    async function updateSw() {
        await updateServiceWorker();
    }

    return (
        <Show when={needRefresh()}>
            <div class="grid grid-cols-[auto_minmax(0,_1fr)_auto] rounded-xl p-4 gap-4 bg-neutral-950/50">
                <div class="self-center">
                    <img src={refresh} alt="refresh" class="w-8 h-8" />
                </div>
                <div class="flex flex-row max-md:items-center justify-between gap-4">
                    <div class="flex flex-col">
                        <SmallHeader>Mutiny Update</SmallHeader>
                        <p class="text-base font-light max-md:hidden">
                            New version of Mutiny has been cached, reload to
                            start using it.
                        </p>
                    </div>
                    <div class="flex items-center">
                        <Button
                            intent="blue"
                            layout="xs"
                            class="self-auto"
                            onClick={updateSw}
                        >
                            Reload
                        </Button>
                    </div>
                </div>
                <button
                    tabindex="-1"
                    onClick={dismissPrompt}
                    class="self-center hover:bg-white/10 rounded-lg active:bg-m-blue w-8"
                >
                    <img src={close} alt="Close" />
                </button>
            </div>
        </Show>
    );
};

export default ReloadPrompt;
