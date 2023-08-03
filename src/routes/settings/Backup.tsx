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
import { useI18n } from "~/i18n/context";

function Quiz(props: { setHasCheckedAll: (hasChecked: boolean) => void }) {
    const i18n = useI18n();
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
                label={i18n.t("settings.backup.confirm")}
            />
            <Checkbox
                checked={two()}
                onChange={setTwo}
                label={i18n.t("settings.backup.responsibility")}
            />
            <Checkbox
                checked={three()}
                onChange={setThree}
                label={i18n.t("settings.backup.liar")}
            />
        </VStack>
    );
}

export default function Backup() {
    const i18n = useI18n();
    const [store, actions] = useMegaStore();
    const navigate = useNavigate();

    const [hasSeenBackup, setHasSeenBackup] = createSignal(false);
    const [hasCheckedAll, setHasCheckedAll] = createSignal(false);
    const [loading, setLoading] = createSignal(false);

    function wroteDownTheWords() {
        setLoading(true);
        actions.setHasBackedUp();
        navigate("/settings/encrypt");
        setLoading(false);
    }

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink
                        href="/settings"
                        title={i18n.t("settings.header")}
                    />
                    <LargeHeader>{i18n.t("settings.backup.title")}</LargeHeader>

                    <VStack>
                        <NiceP>{i18n.t("settings.backup.secure_funds")}</NiceP>
                        <NiceP>
                            {i18n.t("settings.backup.twelve_words_tip")}
                        </NiceP>
                        <NiceP>{i18n.t("settings.backup.warning_one")}</NiceP>
                        <NiceP>{i18n.t("settings.backup.warning_two")}</NiceP>
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
                            loading={loading()}
                        >
                            {i18n.t("settings.backup.confirm")}
                        </Button>
                    </VStack>
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
