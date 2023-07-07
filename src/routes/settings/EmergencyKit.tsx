import { DeleteEverything } from "~/components/DeleteEverything";
import { ImportExport } from "~/components/ImportExport";
import { LoadingIndicator } from "~/components/LoadingIndicator";
import { Logs } from "~/components/Logs";
import NavBar from "~/components/NavBar";
import {
    DefaultMain,
    LargeHeader,
    NiceP,
    SafeArea,
    SmallHeader,
    VStack
} from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import { ExternalLink } from "~/components/layout/ExternalLink";

function EmergencyStack() {
    return (
        <VStack>
            <ImportExport emergency />
            <Logs />
            <div class="rounded-xl p-4 flex flex-col gap-2 bg-m-red overflow-x-hidden">
                <SmallHeader>Danger zone</SmallHeader>
                <DeleteEverything emergency />
            </div>
        </VStack>
    );
}

export default function EmergencyKit() {
    return (
        <SafeArea>
            <DefaultMain>
                <BackLink href="/settings" title="Settings" />
                <LargeHeader>Emergency Kit</LargeHeader>
                <VStack>
                    <LoadingIndicator />
                    <NiceP>
                        If your wallet seems broken, here are some tools to try
                        to debug and repair it.
                    </NiceP>
                    <NiceP>
                        If you have any questions on what these buttons do,
                        please{" "}
                        <ExternalLink href="https://matrix.to/#/#mutiny-community:lightninghackers.com">
                            reach out to us for support.
                        </ExternalLink>
                    </NiceP>
                    <EmergencyStack />
                </VStack>
            </DefaultMain>
            <NavBar activeTab="settings" />
        </SafeArea>
    );
}
