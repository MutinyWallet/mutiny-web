import { ButtonLink, DefaultMain, LargeHeader, NodeManagerGuard, SafeArea, VStack } from "~/components/layout";
import NavBar from "~/components/NavBar";
import { SeedWords } from "~/components/SeedWords";
import { SettingsStringsEditor } from "~/components/SettingsStringsEditor";
import { useMegaStore } from "~/state/megaStore";

export default function Settings() {
    const [store, _actions] = useMegaStore();

    return (
        <NodeManagerGuard>
            <SafeArea>
                <DefaultMain>
                    <LargeHeader>Settings</LargeHeader>
                    <VStack biggap>
                        <VStack>
                            <p class="text-2xl font-light">Write down these words or you'll die!</p>
                            <SeedWords words={store.node_manager?.show_seed() || ""} />
                        </VStack>
                        <SettingsStringsEditor />
                        <ButtonLink href="/admin">"I know what I'm doing"</ButtonLink>
                    </VStack>
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </NodeManagerGuard>
    )
}