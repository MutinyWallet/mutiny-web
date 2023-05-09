import { Button, DefaultMain, LargeHeader, NiceP, NodeManagerGuard, SafeArea, VStack } from "~/components/layout";
import NavBar from "~/components/NavBar";
import { useNavigate } from 'solid-start';
import { SeedWords } from '~/components/SeedWords';
import { useMegaStore } from '~/state/megaStore';
import { Show, createSignal } from 'solid-js';
import { BackLink } from "~/components/layout/BackLink";

export default function App() {
    const [store, actions] = useMegaStore();
    const navigate = useNavigate();

    const [hasSeenBackup, setHasSeenBackup] = createSignal(false);

    function wroteDownTheWords() {
        actions.setHasBackedUp()
        navigate("/")
    }

    return (
        <NodeManagerGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink />
                    <LargeHeader>Backup</LargeHeader>
                    <VStack>
                        <NiceP>Let's get these funds secured.</NiceP>
                        <NiceP>We'll show you 12 words. You write down the 12 words.</NiceP>
                        <NiceP>
                            If you clear your browser history, or lose your device, these 12 words are the only way you can restore your wallet.
                        </NiceP>
                        <NiceP>Mutiny is self-custodial. It's all up to you...</NiceP>
                        <SeedWords words={store.node_manager?.show_seed() || ""} setHasSeen={setHasSeenBackup} />
                        <Show when={hasSeenBackup()}>
                            <NiceP>You are responsible for your funds!</NiceP>
                        </Show>
                        <Button disabled={!hasSeenBackup()} intent="blue" onClick={wroteDownTheWords}>I wrote down the words</Button>
                    </VStack>
                </DefaultMain>
                <NavBar activeTab="none" />
            </SafeArea>
        </NodeManagerGuard>
    );
}
