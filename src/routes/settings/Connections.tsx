import { Show, createMemo } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";
import NavBar from "~/components/NavBar";
import { ShareCard } from "~/components/ShareCard";
import {
    Button,
    DefaultMain,
    LargeHeader,
    MutinyWalletGuard,
    NiceP,
    SafeArea
} from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import { useMegaStore } from "~/state/megaStore";

export default function Connections() {
    const [state, actions] = useMegaStore();

    const connectionURI = createMemo(() => {
        if (state.nwc_enabled) {
            return state.mutiny_wallet?.get_nwc_uri();
        }
    });

    const toggleNwc = async () => {
        if (state.nwc_enabled) {
            actions.setNwc(false);
            window.location.reload();
        } else {
            actions.setNwc(true);
            const nodes = await state.mutiny_wallet?.list_nodes();
            const firstNode = (nodes[0] as string) || "";
            await state.mutiny_wallet?.start_nostr_wallet_connect(firstNode);
        }
    };

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink href="/settings" title="Settings" />
                    <LargeHeader>Wallet Connections</LargeHeader>
                    <NiceP>
                        Authorize Mutiny Wallet with external services like
                        Nostr clients.
                    </NiceP>

                    <Button onClick={toggleNwc}>
                        {state.nwc_enabled
                            ? "Disable Nostr Wallet Connect"
                            : "Enable Nostr Wallet Connect"}
                    </Button>
                    <Show when={connectionURI() && state.nwc_enabled}>
                        <div class="w-full bg-white rounded-xl">
                            <QRCodeSVG
                                value={connectionURI() || ""}
                                class="w-full h-full p-8 max-h-[400px]"
                            />
                        </div>
                        <ShareCard text={connectionURI() || ""} />
                    </Show>
                    <div class="h-full" />
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
