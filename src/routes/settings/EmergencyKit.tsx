import { DeleteEverything } from "~/components/DeleteEverything";
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
                        Please{" "}
                        <ExternalLink href="https://matrix.to/#/#mutiny-community:lightninghackers.com">
                            reach out to us for support
                        </ExternalLink>{" "}
                        if you need help.
                    </NiceP>
                    <NiceP>
                        Deleting everything is a last resort and{" "}
                        <strong>can result in loss of funds!</strong>
                    </NiceP>
                    <EmergencyStack />
                </VStack>
            </DefaultMain>
            <NavBar activeTab="settings" />
        </SafeArea>
    );
}
