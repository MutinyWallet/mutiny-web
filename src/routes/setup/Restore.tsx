import {
    BackLink,
    DefaultMain,
    LargeHeader,
    NiceP,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { TwelveWordsEntry } from "~/routes/settings/Restore";

export function SetupRestore() {
    const i18n = useI18n();
    return (
        <DefaultMain>
            <BackLink
                showOnDesktop
                title={i18n.t("modals.onboarding.setup")}
                href="/setup"
            />
            <LargeHeader>{i18n.t("settings.restore.title")}</LargeHeader>
            <VStack>
                <NiceP>
                    <p>{i18n.t("settings.restore.restore_tip")}</p>
                    <p>{i18n.t("settings.restore.multi_browser_warning")}</p>
                </NiceP>
                <TwelveWordsEntry />
            </VStack>
        </DefaultMain>
    );
}
