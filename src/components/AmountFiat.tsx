import { useMegaStore } from "~/state/megaStore";
import { satsToUsd } from "~/utils/conversions";

export function AmountFiat(props: {
    amountSats: bigint | number | undefined;
    loading?: boolean;
    classes?: string;
}) {
    const [state, _] = useMegaStore();

    const amountInUsd = () =>
        satsToUsd(state.price, Number(props.amountSats) || 0, true);

    return (
        <div class={`flex flex-col gap-1 ${props.classes}`}>
            <h2 class="font-light text-white/70">
                ~{props.loading ? "..." : amountInUsd()}
                <span>&nbsp;USD</span>
            </h2>
        </div>
    );
}
