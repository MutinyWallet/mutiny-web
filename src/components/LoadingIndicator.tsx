import { Progress } from "@kobalte/core";
import { Show } from "solid-js";
import { useMegaStore } from "~/state/megaStore";

export function LoadingBar(props: { value: number; max: number }) {
    function valueToStage(value: number) {
        switch (value) {
            case 0:
                return "Just getting started";
            case 1:
                return "Double checking something";
            case 2:
                return "Downloading";
            case 3:
                return "Setup";
            case 4:
                return "Done";
            default:
                return "Just getting started";
        }
    }
    return (
        <Progress.Root
            value={props.value}
            minValue={0}
            maxValue={props.max}
            getValueLabel={({ value }) => `Loading: ${valueToStage(value)}`}
            class="w-full flex flex-col gap-2"
        >
            <Progress.ValueLabel class="text-sm text-m-grey-400" />
            <Progress.Track class="h-6  bg-white/10 rounded">
                <Progress.Fill class="bg-m-blue rounded h-full w-[var(--kb-progress-fill-width)] transition-[width]" />
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
            case "setup":
                return 3;
            case "done":
                return 4;
            default:
                return 0;
        }
    };

    return (
        <Show when={state.load_stage !== "done"}>
            <LoadingBar value={loadStageValue()} max={4} />
        </Show>
    );
}
