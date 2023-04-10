import Reader from "~/components/Reader";
import { createSignal, Show } from "solid-js";
import { useNavigate } from "solid-start";
import { Button } from "~/components/Button";

export default function Scanner() {
    const [scanResult, setScanResult] = createSignal<string | null>(null);
    const navigate = useNavigate();

    function onResult(result: string) {
        setScanResult(result);
    }

    function exit() {
        navigate("/", { replace: true })
    }

    return (
        <>
            <Show when={scanResult()} fallback={<Reader onResult={onResult} />}>
                <div class="w-full p-8">
                    <div class="mt-[20vw] rounded-xl p-4 flex flex-col gap-2 bg-[rgba(0,0,0,0.5)]">
                        <header class='text-sm font-semibold uppercase'>
                            Scan Result
                        </header>
                        <code class="break-all">{scanResult()}</code>
                    </div>
                </div>
            </Show>
            <div class="w-full flex flex-col items-center fixed bottom-[2rem] gap-8 px-8">
                <Show when={scanResult()}
                    fallback={
                        <div class="w-full max-w-[800px] flex flex-col gap-2">
                            <Button intent="blue" onClick={exit}>Paste Something</Button>
                            <Button onClick={exit}>Cancel</Button>
                        </div>
                    }>
                    <Button intent="red" onClick={() => setScanResult(null)}>Try Again</Button>
                    <Button onClick={exit}>Cancel</Button>
                </Show>
            </div>
        </>
    );
}