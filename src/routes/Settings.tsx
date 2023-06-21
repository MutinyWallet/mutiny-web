import {
    ButtonLink,
    Card,
    DefaultMain,
    LargeHeader,
    MutinyWalletGuard,
    NiceP,
    SafeArea,
    VStack
} from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import NavBar from "~/components/NavBar";
import { SeedWords } from "~/components/SeedWords";
import { SettingsStringsEditor } from "~/components/SettingsStringsEditor";
import { useMegaStore } from "~/state/megaStore";
import { LiquidityMonitor } from "~/components/LiquidityMonitor";
import { A } from "solid-start";
import { Suspense } from "solid-js";

export default function Settings() {
    const [store, _actions] = useMegaStore();

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink />
                    <LargeHeader>Settings</LargeHeader>
                    <VStack biggap>
                        <LiquidityMonitor />
                        <Card title="Backup your seed words">
                            <VStack>
                                <NiceP>
                                    These 12 words allow you to recover your
                                    on-chain funds in case you lose your device
                                    or clear your browser storage.
                                </NiceP>
                                <SeedWords
                                    words={
                                        store.mutiny_wallet?.show_seed() || ""
                                    }
                                />
                            </VStack>
                        </Card>
                        <SettingsStringsEditor />
                        <Card title="Emergency Kit">
                            <NiceP>
                                Having some serious problems with your wallet?
                                Check out the{" "}
                                <A href="/emergencykit">emergency kit.</A>
                            </NiceP>
                        </Card>
                        <Card title="If you know what you're doing">
                            <VStack>
                                <NiceP>
                                    We have some not-very-pretty debug tools we
                                    use to test the wallet. Use wisely!
                                </NiceP>
                                <div class="flex justify-center">
                                    <ButtonLink href="/admin" layout="xs">
                                        Secret Debug Tools
                                    </ButtonLink>
                                </div>
                            </VStack>
                        </Card>
                    </VStack>
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
