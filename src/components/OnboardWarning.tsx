import { Show, createSignal } from "solid-js";
import { Button, ButtonLink, SmallHeader } from "./layout";
import { useMegaStore } from "~/state/megaStore";
import { showToast } from "./Toaster";
import save from "~/assets/icons/save.svg";
import close from "~/assets/icons/close.svg";
import restore from "~/assets/icons/upload.svg";

export function OnboardWarning() {
    const [state, actions] = useMegaStore();
    const [dismissedBackup, setDismissedBackup] = createSignal(false);

    function hasMoney() {
        return (
            state.balance?.confirmed ||
            state.balance?.lightning ||
            state.balance?.unconfirmed ||
            state.balance?.force_close
        );
    }

    return (
        <>
            {/* TODO: show this once we have a restore flow */}
            <Show when={false}>
                <div class="grid grid-cols-[auto_minmax(0,_1fr)_auto] rounded-xl p-4 gap-4 bg-neutral-950/50">
                    <div class="self-center">
                        <img src={restore} alt="backup" class="w-8 h-8" />
                    </div>
                    <div class="flex md:flex-row flex-col items-center gap-4">
                        <div class="flex flex-col">
                            <SmallHeader>Welcome!</SmallHeader>
                            <p class="text-base font-light">
                                If you've used Mutiny before you can restore
                                from a backup. Otherwise you can skip this and
                                enjoy your new wallet!
                            </p>
                        </div>
                        <Button
                            intent="green"
                            layout="xs"
                            class="self-start md:self-auto"
                            onClick={() => {
                                showToast({
                                    title: "Unimplemented",
                                    description: "We don't do that yet"
                                });
                            }}
                        >
                            Restore
                        </Button>
                    </div>
                    <button
                        tabindex="-1"
                        onClick={() => {
                            actions.dismissRestorePrompt();
                        }}
                        class="self-center hover:bg-white/10 rounded-lg active:bg-m-blue w-8"
                    >
                        <img src={close} alt="Close" />
                    </button>
                </div>
            </Show>
            <Show
                when={!state.has_backed_up && hasMoney() && !dismissedBackup()}
            >
                <div class="grid grid-cols-[auto_minmax(0,_1fr)_auto] rounded-xl p-4 gap-4 bg-neutral-950/50">
                    <div class="self-center">
                        <img src={save} alt="backup" class="w-8 h-8" />
                    </div>
                    <div class="flex flex-row max-md:items-center justify-between gap-4">
                        <div class="flex flex-col">
                            <SmallHeader>Secure your funds</SmallHeader>
                            <p class="text-base font-light max-md:hidden">
                                You have money stored in this browser. Let's
                                make sure you have a backup.
                            </p>
                        </div>
                        <div class="flex items-center">
                            <ButtonLink
                                intent="blue"
                                layout="xs"
                                class="self-auto"
                                href="/backup"
                            >
                                Backup
                            </ButtonLink>
                        </div>
                    </div>
                    <button
                        tabindex="-1"
                        onClick={() => {
                            setDismissedBackup(true);
                        }}
                        class="self-center hover:bg-white/10 rounded-lg active:bg-m-blue w-8"
                    >
                        <img src={close} alt="Close" />
                    </button>
                </div>
            </Show>
        </>
    );
}
