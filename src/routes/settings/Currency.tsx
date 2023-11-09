import {
    BackLink,
    Card,
    ChooseCurrency,
    DefaultMain,
    LargeHeader,
    MutinyWalletGuard,
    NavBar,
    SafeArea
} from "~/components";
import { useI18n } from "~/i18n/context";

export function Currency() {
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
                        {i18n.t("settings.currency.title")}
                    </LargeHeader>
                    <Card title={i18n.t("settings.currency.select_currency")}>
                        <ChooseCurrency />
                    </Card>
                    <div class="h-full" />
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
