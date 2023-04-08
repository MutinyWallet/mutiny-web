import { createResource, Show } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";
import { Button } from "~/components/Button";
import NavBar from "~/components/NavBar";
import SafeArea from "~/components/SafeArea";
import { useMegaStore } from "~/state/megaStore";
import { useCopy } from "~/utils/useCopy";

export default function Receive() {
    const [state, _] = useMegaStore()

    // TODO: would be nice if this was just newest unused address
    const getNewAddress = async () => {
        if (state.node_manager) {
            console.log("Getting new address");
            const address = await state.node_manager?.get_new_address();
            return address
        } else {
            return undefined
        }
    };

    const [address, { refetch: refetchAddress }] = createResource(getNewAddress);

    const [copy, copied] = useCopy({ copiedTimeout: 1000 });

    async function share() {
        // If the browser doesn't support share we can just copy the address
        if (!navigator.share) {
            copy(address() ?? "");
            copied();

        }
        const shareData: ShareData = {
            title: "Mutiny Wallet",
            text: address(),
        }

        try {
            await navigator.share(shareData)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <SafeArea>
            <main class='flex flex-col py-8 px-4 items-center'>
                <div class="max-w-[400px] flex flex-col gap-4">
                    <Show when={address()}>
                        <div class="w-full bg-white rounded-xl">
                            <QRCodeSVG value={address() ?? ""} class="w-full h-full p-8 max-h-[400px]" />
                        </div>
                        <div class="flex gap-2 w-full">
                            <Button onClick={() => copy(address() ?? "")}>{copied() ? "Copied" : "Copy"}</Button>
                            <Button onClick={share}>Share</Button>
                        </div>
                        <div class="rounded-xl p-4 flex flex-col gap-2 bg-[rgba(0,0,0,0.5)]">
                            <header class='text-sm font-semibold uppercase'>
                                Address / Invoice
                            </header>
                            <code class="break-all">{address()}</code>
                            <Button onClick={refetchAddress}>Get new address</Button>
                        </div>
                    </Show>
                </div>
            </main>
            <NavBar activeTab="none" />
        </SafeArea >

    )
}