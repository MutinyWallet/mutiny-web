import Reader from "~/components/Reader";
import { createEffect, createSignal, Show } from "solid-js";
import { useNavigate } from "solid-start";
import { Button, SafeArea } from "~/components/layout";

export default function Scanner() {
    const [scanResult, setScanResult] = createSignal<string>();
    const navigate = useNavigate();

    function onResult(result: string) {
        setScanResult(result);
    }

    // TODO: is this correct? we always go back to where we came from when we scan... kind of like scan is a modal tbh
    function exit() {
        history.back();
    }

    function handlePaste() {
        navigator.clipboard.readText().then(text => {
            setScanResult(text);
        });
    }

    // When we have a nice result we can head over to the send screen
    createEffect(() => {
        if (scanResult()) {
            navigate("/send", { state: { destination: scanResult() } })
        }
    })

    return (
        <div class="safe-top safe-left safe-right safe-bottom h-screen-safe">
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
                            <Button intent="blue" onClick={handlePaste}>Paste Something</Button>
                            <Button onClick={exit}>Cancel</Button>
                        </div>
                    }>
                    <Button intent="red" onClick={() => setScanResult(undefined)}>Try Again</Button>
                    <Button onClick={exit}>Cancel</Button>
                </Show>
            </div>
        </div>
    );
}