import { RotateCw, X } from "lucide-solid";
import { Show } from "solid-js";
// eslint-disable-next-line import/no-unresolved
import { useRegisterSW } from "virtual:pwa-register/solid";

import { useI18n } from "~/i18n/context";

import { SmallHeader } from "./layout";
import { Button } from "./layout/Button";

export function ReloadPrompt() {
    const i18n = useI18n();

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
            <div class="grid grid-cols-[auto_minmax(0,_1fr)_auto] gap-4 rounded-xl bg-neutral-950/50 p-4">
                <div class="self-center">
                    <RotateCw class="h-8 w-8" />
                </div>
                <div class="flex flex-row justify-between gap-4 max-md:items-center">
                    <div class="flex flex-col">
                        <SmallHeader>
                            {i18n.t("reload.mutiny_update")}
                        </SmallHeader>
                        <p class="text-base font-light max-md:hidden">
                            {i18n.t("reload.new_version_description")}
                        </p>
                    </div>
                    <div class="flex items-center">
                        <Button
                            intent="blue"
                            layout="xs"
                            class="self-auto"
                            onClick={updateSw}
                        >
                            {i18n.t("reload.reload")}
                        </Button>
                    </div>
                </div>
                <button
                    tabindex="-1"
                    onClick={dismissPrompt}
                    class="w-8 self-center rounded-lg hover:bg-white/10 active:bg-m-blue"
                >
                    <X class="h-8 w-8" />
                </button>
            </div>
        </Show>
    );
}
