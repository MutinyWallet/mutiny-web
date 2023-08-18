import {
    DeleteEverything,
    KitchenSink,
    NavBar,
    DefaultMain,
    LargeHeader,
    MutinyWalletGuard,
    NiceP,
    SafeArea,
    SmallHeader,
    VStack,
    BackLink
} from "~/components";
import { useI18n } from "~/i18n/context";

export default function Admin() {
    const i18n = useI18n();
    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink
                        href="/settings"
                        title={i18n.t("settings.header")}
                    />
                    <LargeHeader>{i18n.t("settings.admin.header")}</LargeHeader>
                    <VStack>
                        <NiceP>{i18n.t("settings.admin.warning_one")}</NiceP>
                        <NiceP>{i18n.t("settings.admin.warning_two")}</NiceP>
                        <KitchenSink />
                        <div class="rounded-xl p-4 flex flex-col gap-2 bg-m-red overflow-x-hidden">
                            <SmallHeader>
                                {i18n.t("settings.danger_zone")}
                            </SmallHeader>
                            <DeleteEverything />
                        </div>
                    </VStack>
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
