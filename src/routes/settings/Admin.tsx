import { DeleteEverything } from "~/components/DeleteEverything";
import KitchenSink from "~/components/KitchenSink";
import NavBar from "~/components/NavBar";
import {
    DefaultMain,
    LargeHeader,
    MutinyWalletGuard,
    NiceP,
    SafeArea,
    SmallHeader,
    VStack
} from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";

export default function Admin() {
    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink href="/settings" title="Settings" />
                    <LargeHeader>Secret Debug Tools</LargeHeader>
                    <VStack>
                        <NiceP>
                            If you know what you're doing you're in the right
                            place.
                        </NiceP>
                        <NiceP>
                            These are internal tools we use to debug and test
                            the app. Please be careful!
                        </NiceP>
                        <KitchenSink />
                        <div class="rounded-xl p-4 flex flex-col gap-2 bg-m-red overflow-x-hidden">
                            <SmallHeader>Danger zone</SmallHeader>
                            <DeleteEverything />
                        </div>
                    </VStack>
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
