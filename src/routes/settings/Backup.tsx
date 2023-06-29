import {
    Button,
    DefaultMain,
    LargeHeader,
    NiceP,
    MutinyWalletGuard,
    SafeArea,
    VStack,
    Checkbox
} from "~/components/layout";
import NavBar from "~/components/NavBar";
import { useNavigate } from "solid-start";
import { SeedWords } from "~/components/SeedWords";
import { useMegaStore } from "~/state/megaStore";
import { Show, createEffect, createSignal } from "solid-js";
import { BackLink } from "~/components/layout/BackLink";

function Quiz(props: { setHasCheckedAll: (hasChecked: boolean) => void }) {
    const [one, setOne] = createSignal(false);
    const [two, setTwo] = createSignal(false);
    const [three, setThree] = createSignal(false);

    createEffect(() => {
        if (one() && two() && three()) {
            props.setHasCheckedAll(true);
        } else {
            props.setHasCheckedAll(false);
        }
    });

    return (
        <VStack>
            <Checkbox
                checked={one()}
                onChange={setOne}
                label="I wrote down the words"
            />
            <Checkbox
                checked={two()}
                onChange={setTwo}
                label="I understand that my funds are my responsibility"
            />
            <Checkbox
                checked={three()}
                onChange={setThree}
                label="I'm not lying just to get this over with"
            />
        </VStack>
    );
}

export default function Backup() {
    const [store, actions] = useMegaStore();
    const navigate = useNavigate();

    const [hasSeenBackup, setHasSeenBackup] = createSignal(false);
    const [hasCheckedAll, setHasCheckedAll] = createSignal(false);

    function wroteDownTheWords() {
        actions.setHasBackedUp();
        navigate("/");
    }

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink href="/settings" title="Settings" />
                    <LargeHeader>Backup</LargeHeader>

                    <VStack>
                        <NiceP>Let's get these funds secured.</NiceP>
                        <NiceP>
                            We'll show you 12 words. You write down the 12
                            words.
                        </NiceP>
                        <NiceP>
                            If you clear your browser history, or lose your
                            device, these 12 words are the only way you can
                            restore your wallet.
                        </NiceP>
                        <NiceP>
                            Mutiny is self-custodial. It's all up to you...
                        </NiceP>
                        <SeedWords
                            words={store.mutiny_wallet?.show_seed() || ""}
                            setHasSeen={setHasSeenBackup}
                        />
                        <Show when={hasSeenBackup()}>
                            <Quiz setHasCheckedAll={setHasCheckedAll} />
                        </Show>
                        <Button
                            disabled={!hasSeenBackup() || !hasCheckedAll()}
                            intent="blue"
                            onClick={wroteDownTheWords}
                        >
                            I wrote down the words
                        </Button>
                    </VStack>
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
