import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";

import logo from "~/assets/mutiny-pixel-logo.png";
import { Button, DefaultMain, NiceP } from "~/components";
import { useMegaStore } from "~/state/megaStore";

export function Setup() {
    const [_state, actions] = useMegaStore();

    const [isCreatingNewWallet, setIsCreatingNewWallet] = createSignal(false);
    const navigate = useNavigate();

    async function handleNewWallet() {
        try {
            setIsCreatingNewWallet(true);
            const profileSetupStage = localStorage.getItem(
                "profile_setup_stage"
            );

            // Check for nip07 browser extension. If it exists, we can skip the profile setup
            const hasNip07 = Object.prototype.hasOwnProperty.call(
                window,
                "nostr"
            );

            await actions.setup(undefined);

            if (!profileSetupStage && !hasNip07) {
                navigate("/newprofile");
            } else {
                navigate("/");
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    return (
        <DefaultMain>
            {/* <LargeHeader>Setup</LargeHeader> */}
            <div class="flex flex-1 flex-col items-center justify-between gap-4">
                <div class="flex-[2]" />
                <div class="flex flex-col items-center gap-4">
                    <img
                        id="mutiny-logo"
                        src={logo}
                        class="h-[50px] w-[172px]"
                        alt="Mutiny Plus logo"
                    />
                    <NiceP>Welcome to the Mutiny!</NiceP>
                    <div class="h-4" />
                    <Button
                        layout="full"
                        onClick={handleNewWallet}
                        loading={isCreatingNewWallet()}
                    >
                        New Wallet
                    </Button>
                    <Button
                        intent="text"
                        layout="full"
                        disabled={isCreatingNewWallet()}
                        onClick={() => navigate("/setup/restore")}
                    >
                        Import Existing
                    </Button>
                </div>
                <div class="flex-1" />
            </div>
        </DefaultMain>
    );
}
