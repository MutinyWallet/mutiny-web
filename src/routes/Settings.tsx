import {
    ButtonLink,
    DefaultMain,
    LargeHeader,
    MutinyWalletGuard,
    SafeArea,
    VStack
} from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import { Logs } from "~/components/Logs";
import { Restart } from "~/components/Restart";
import NavBar from "~/components/NavBar";
import { SeedWords } from "~/components/SeedWords";
import { SettingsStringsEditor } from "~/components/SettingsStringsEditor";
import { useMegaStore } from "~/state/megaStore";

export default function Settings() {
    const [store, _actions] = useMegaStore();

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink />
                    <LargeHeader>Settings</LargeHeader>
                    <VStack biggap>
                        <VStack>
                            <p class="text-2xl font-light">
                                Write down these words or you'll die!
                            </p>
                            <SeedWords
                                words={store.mutiny_wallet?.show_seed() || ""}
                            />
                        </VStack>
                        <SettingsStringsEditor />
                        <Logs />
                        <Restart />
                        <ButtonLink href="/admin">
                            "I know what I'm doing"
                        </ButtonLink>
                    </VStack>
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
