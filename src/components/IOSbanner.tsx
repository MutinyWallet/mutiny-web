import { X } from "lucide-solid";
import { Show } from "solid-js";

import { ButtonLink } from "~/components";
import { useMegaStore } from "~/state/megaStore";

export function IOSbanner() {
    const [state, actions] = useMegaStore();

    function closeBanner() {
        actions.setTestFlightPromptDismissed();
    }

    return (
        <>
            <Show when={true}>
                <div class="grid grid-cols-[auto_minmax(0,_1fr)_auto] gap-4 rounded-xl bg-white p-4">
                    <div class="self-center">
                        <span class="h-8 w-8 text-3xl text-black"></span>
                    </div>
                    <div class="flex flex-col justify-center text-black">
                        <header class={`text-sm font-semibold`}>
                            iOS TESTFLIGHT FOR MUTINY
                            <span class="text-m-red">+</span> USERS
                        </header>
                    </div>
                    <div class="flex items-center gap-4">
                        <ButtonLink
                            intent="green"
                            layout="xs"
                            href={
                                state.mutiny_plus
                                    ? "https://testflight.apple.com/join/9g23f0Mc"
                                    : "/settings/plus"
                            }
                        >
                            Join
                        </ButtonLink>
                        <button
                            onClick={closeBanner}
                            class="self-center justify-self-center rounded-lg hover:bg-white/10 active:bg-m-blue"
                        >
                            <X class="h-8 w-8 text-black" />
                        </button>{" "}
                    </div>
                </div>
            </Show>
        </>
    );
}
