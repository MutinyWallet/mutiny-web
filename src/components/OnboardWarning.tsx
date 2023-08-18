import { Show } from "solid-js";

import save from "~/assets/icons/save.svg";
import { ButtonLink, SmallHeader } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function OnboardWarning() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    return (
        <>
            <Show when={!state.has_backed_up}>
                <div class="grid grid-cols-[auto_minmax(0,_1fr)_auto] gap-4 rounded-xl bg-neutral-950/50 p-4">
                    <div class="self-center">
                        <img src={save} alt="backup" class="h-8 w-8" />
                    </div>
                    <div class="flex flex-col justify-center">
                        <SmallHeader>
                            {i18n.t("modals.onboarding.secure_your_funds")}
                        </SmallHeader>
                    </div>
                    <div class="flex items-center">
                        <ButtonLink
                            intent="blue"
                            layout="xs"
                            class="self-auto"
                            href="/settings/backup"
                        >
                            {i18n.t("settings.backup.title")}
                        </ButtonLink>
                    </div>
                </div>
            </Show>
        </>
    );
}
