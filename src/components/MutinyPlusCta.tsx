import { A } from "@solidjs/router";
import { ParentComponent, Show } from "solid-js";

import forward from "~/assets/icons/forward.svg";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

const CtaCard: ParentComponent = (props) => {
    return (
        <div class="w-full">
            <div class="relative">
                <div class="to-bg-m-grey-900/50 absolute inset-0 h-full w-full scale-[0.60] transform rounded-full bg-m-red/50 bg-gradient-to-r from-m-red/50 blur-2xl" />
                <div class="relative flex-col gap-2 rounded-xl border border-m-red bg-m-grey-800 py-4">
                    {props.children}{" "}
                </div>
            </div>
        </div>
    );
};

export function MutinyPlusCta() {
    const [state, _actions] = useMegaStore();
    const i18n = useI18n();
    return (
        <CtaCard>
            <A
                href={"/settings/plus"}
                class="flex w-full flex-col gap-1 px-4 py-2 no-underline hover:bg-m-grey-750 active:bg-m-grey-900"
            >
                <div class="flex justify-between">
                    <span>
                        {i18n.t("common.mutiny")}
                        <span class="text-m-red">+</span>
                    </span>
                    <img src={forward} alt="go" />
                </div>
                <div class="text-sm text-m-grey-400">
                    <Show
                        when={state.mutiny_plus}
                        fallback={i18n.t("settings.plus.cta_description")}
                    >
                        {i18n.t("settings.plus.cta_but_already_plus")}
                    </Show>
                </div>
            </A>
        </CtaCard>
    );
}
