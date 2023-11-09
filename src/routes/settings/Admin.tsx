import {
    BackLink,
    DefaultMain,
    DeleteEverything,
    KitchenSink,
    LargeHeader,
    MutinyWalletGuard,
    NavBar,
    NiceP,
    SafeArea,
    SmallHeader,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";

export function Admin() {
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
                        <div class="flex flex-col gap-2 overflow-x-hidden rounded-xl bg-m-red p-4">
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
