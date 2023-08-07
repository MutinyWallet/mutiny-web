import { Show } from "solid-js";
import { ButtonLink, SmallHeader } from "./layout";
import { useMegaStore } from "~/state/megaStore";
import save from "~/assets/icons/save.svg";
import { useI18n } from "~/i18n/context";

export function OnboardWarning() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    return (
        <>
            <Show when={!state.has_backed_up}>
                <div class="grid grid-cols-[auto_minmax(0,_1fr)_auto] rounded-xl p-4 gap-4 bg-neutral-950/50">
                    <div class="self-center">
                        <img src={save} alt="backup" class="w-8 h-8" />
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
