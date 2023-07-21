import { Progress } from "@kobalte/core";
import { SmallHeader } from ".";
import { useI18n } from "~/i18n/context";

export default function formatNumber(num: number) {
    const map = [
        { suffix: "T", threshold: 1e12 },
        { suffix: "B", threshold: 1e9 },
        { suffix: "M", threshold: 1e6 },
        { suffix: "K", threshold: 1e3 },
        { suffix: "", threshold: 1 }
    ];

    const found = map.find((x) => Math.abs(num) >= x.threshold);
    if (found) {
        const formatted =
            (num / found.threshold).toLocaleString() + found.suffix;
        return formatted;
    }

    return num.toLocaleString();
}

export function ProgressBar(props: { value: number; max: number }) {
    const i18n = useI18n();
    return (
        <Progress.Root
            value={props.value}
            minValue={0}
            maxValue={props.max}
            getValueLabel={({ value, max }) =>
                `${formatNumber(value)} ${i18n.t(
                    "send.progress_bar.of"
                )} ${formatNumber(max)} ${i18n.t(
                    "send.progress_bar.sats_sent"
                )}`
            }
            class="w-full flex flex-col gap-2"
        >
            <div class="flex justify-between">
                <Progress.Label>
                    <SmallHeader>{i18n.t("send.sending")}</SmallHeader>
                </Progress.Label>
                <Progress.ValueLabel class="text-sm font-semibold uppercase" />
            </div>
            <Progress.Track class="h-6  bg-white/10 rounded">
                <Progress.Fill class="bg-m-red rounded h-full w-[var(--kb-progress-fill-width)] transition-[width]" />
            </Progress.Track>
        </Progress.Root>
    );
}
