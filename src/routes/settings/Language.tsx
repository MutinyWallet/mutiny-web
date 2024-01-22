import {
    BackLink,
    Card,
    ChooseLanguage,
    DefaultMain,
    LargeHeader,
    MutinyWalletGuard,
    NavBar,
    SafeArea
} from "~/components";
import { useI18n } from "~/i18n/context";

export function Language() {
    const i18n = useI18n();
    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink
                        href="/settings"
                        title={i18n.t("settings.header")}
                    />
                    <LargeHeader>
                        {i18n.t("settings.language.title")}
                    </LargeHeader>
                    <Card title={i18n.t("settings.language.select_language")}>
                        <ChooseLanguage />
                    </Card>
                    <div class="h-full" />
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
