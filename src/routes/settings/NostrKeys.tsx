import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";

import {
    BackPop,
    DefaultMain,
    ExternalLink,
    FancyCard,
    KeyValue,
    LargeHeader,
    MiniStringShower,
    MutinyWalletGuard,
    NavBar,
    NiceP,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

export function NostrKeys() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const npub = () => state.mutiny_wallet?.get_npub();
    const nsec = () => state.mutiny_wallet?.export_nsec();

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <BackPop default="/settings" />
                <LargeHeader>{i18n.t("settings.nostr_keys.title")}</LargeHeader>
                <NiceP>{i18n.t("settings.nostr_keys.description")}</NiceP>
                <NiceP>
                    <ExternalLink href="https://nostr.com/">
                        {i18n.t("settings.nostr_keys.learn_more")}
                    </ExternalLink>
                </NiceP>
                <FancyCard>
                    <VStack>
                        <div class="w-[10rem] self-center rounded bg-white p-[1rem]">
                            <QRCodeSVG
                                value={npub() || ""}
                                class="h-full max-h-[256px] w-full"
                            />
                        </div>
                        <KeyValue key="Public Key">
                            <MiniStringShower text={npub() || ""} />
                        </KeyValue>
                        <Show when={nsec()}>
                            <KeyValue key="Private Key">
                                <MiniStringShower text={nsec() || ""} hide />
                            </KeyValue>
                            <p class="text-base italic text-m-grey-350">
                                {i18n.t("settings.nostr_keys.warning")}
                            </p>
                        </Show>
                    </VStack>
                </FancyCard>
                <A
                    href="/settings/importprofile"
                    class="self-center text-base font-normal text-m-grey-400"
                >
                    Import different nostr profile
                </A>
            </DefaultMain>
            <NavBar activeTab="settings" />
        </MutinyWalletGuard>
    );
}
