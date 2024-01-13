import { Progress } from "@kobalte/core";
import { Show } from "solid-js";

import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

function LoadingBar(props: { value: number; max: number }) {
    const i18n = useI18n();
    function valueToStage(value: number) {
        switch (value) {
            case 0:
                return i18n.t("modals.loading.default");
            case 1:
                return i18n.t("modals.loading.double_checking");
            case 2:
                return i18n.t("modals.loading.downloading");
            case 3:
                return i18n.t("modals.loading.existing_wallet");
            case 4:
                return i18n.t("modals.loading.setup");
            case 5:
                return i18n.t("modals.loading.done");
            default:
                return i18n.t("modals.loading.default");
        }
    }
    return (
        <Progress.Root
            value={props.value}
            minValue={0}
            maxValue={props.max}
            getValueLabel={({ value }) =>
                i18n.t("modals.loading.loading", { stage: valueToStage(value) })
            }
            class="flex w-full flex-col gap-2"
        >
            <Progress.ValueLabel class="text-sm text-m-grey-400" />
            <Progress.Track class="h-6  rounded bg-white/10">
                <Progress.Fill class="h-full w-[var(--kb-progress-fill-width)] rounded bg-m-blue transition-[width]" />
            </Progress.Track>
        </Progress.Root>
    );
}

export function LoadingIndicator() {
    const [state, _actions] = useMegaStore();

    const loadStageValue = () => {
        switch (state.load_stage) {
            case "fresh":
                return 0;
            case "checking_double_init":
                return 1;
            case "downloading":
                return 2;
            case "checking_for_existing_wallet":
                return 3;
            case "setup":
                return 4;
            case "done":
                return 5;
            default:
                return 0;
        }
    };

    return (
        <Show when={state.load_stage !== "done"}>
            <LoadingBar value={loadStageValue()} max={5} />
        </Show>
    );
}
