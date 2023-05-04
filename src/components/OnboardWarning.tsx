import { Show, createSignal, onMount } from "solid-js";
import { Button, ButtonLink, SmallHeader, VStack } from "./layout";
import { useMegaStore } from "~/state/megaStore";

export function OnboardWarning() {
    const [state, actions] = useMegaStore();
    const [dismissedBackup, setDismissedBackup] = createSignal(false);

    onMount(() => {
        actions.sync()
    })

    function hasMoney() {
        return state.balance?.confirmed || state.balance?.lightning || state.balance?.unconfirmed
    }

    return (
        <>
            {/* TODO: show this once we have a restore flow */}
            <Show when={!state.dismissed_restore_prompt && false}>
                <div class='rounded-xl p-4 flex flex-col gap-2 bg-neutral-950 overflow-x-hidden'>
                    <SmallHeader>Welcome!</SmallHeader>
                    <VStack>
                        <p class="text-2xl font-light">
                            Do you want to restore an existing Mutiny Wallet?
                        </p>
                        <div class="w-full flex gap-2">
                            <Button intent="green" onClick={() => { }}>Restore</Button>
                            <Button onClick={actions.dismissRestorePrompt}>Nope</Button>
                        </div>
                    </VStack>
                </div>
            </Show>
            <Show when={!state.has_backed_up && hasMoney() && !dismissedBackup()}>
                <div class='rounded-xl p-4 flex flex-col gap-2 bg-neutral-950 overflow-x-hidden'>
                    <SmallHeader>Secure your funds</SmallHeader>
                    <p class="text-2xl font-light">
                        You have money stored in this browser. Let's make sure you have a backup.
                    </p>
                    <div class="w-full flex gap-2">
                        <ButtonLink intent="blue" href="/backup">Backup</ButtonLink>
                        <Button onClick={() => { setDismissedBackup(true) }}>Nope</Button>
                    </div>
                </div>
            </Show>
        </>
    )
}