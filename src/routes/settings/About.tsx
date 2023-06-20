import {
    DefaultMain,
    LargeHeader,
    MutinyWalletGuard,
    NiceP,
    SafeArea,
    VStack
} from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import { ExternalLink } from "~/components/layout/ExternalLink";
import NavBar from "~/components/NavBar";

export default function About() {
    const COMMIT_HASH = import.meta.env.VITE_COMMIT_HASH;
    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink href="/settings" title="Settings" />
                    <LargeHeader>About Mutiny</LargeHeader>
                    <VStack>
                        <NiceP>
                            <ExternalLink
                                href={`https://github.com/MutinyWallet/mutiny-web/commits/${COMMIT_HASH}`}
                            >
                                Commit{" "}
                                {COMMIT_HASH
                                    ? COMMIT_HASH.slice(0, 7)
                                    : "Undefined"}
                            </ExternalLink>
                        </NiceP>
                        <NiceP>
                            <ExternalLink href="https://github.com/MutinyWallet/mutiny-node/releases/tag/v0.4.3">
                                Version 0.4.3
                            </ExternalLink>
                        </NiceP>
                    </VStack>
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
