import {
    BackLink,
    DefaultMain,
    DeleteEverything,
    ExternalLink,
    ImportExport,
    LargeHeader,
    LoadingIndicator,
    Logs,
    NavBar,
    NiceP,
    SafeArea,
    SmallHeader,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";

function EmergencyStack() {
    const i18n = useI18n();
    return (
        <VStack>
            <ImportExport emergency />
            <Logs />
            <div class="flex flex-col gap-2 overflow-x-hidden rounded-xl bg-m-red p-4">
                <SmallHeader>{i18n.t("settings.danger_zone")}</SmallHeader>
                <DeleteEverything emergency />
            </div>
        </VStack>
    );
}

export function EmergencyKit() {
    const i18n = useI18n();
    return (
        <SafeArea>
            <DefaultMain>
                <BackLink href="/settings" title={i18n.t("settings.header")} />
                <LargeHeader>
                    {i18n.t("settings.emergency_kit.title")}
                </LargeHeader>
                <VStack>
                    <LoadingIndicator />
                    <NiceP>
                        {i18n.t("settings.emergency_kit.emergency_tip")}
                    </NiceP>
                    <NiceP>
                        {i18n.t("settings.emergency_kit.questions")}{" "}
                        <ExternalLink href="https://matrix.to/#/#mutiny-community:lightninghackers.com">
                            {i18n.t("settings.emergency_kit.link")}
                        </ExternalLink>
                    </NiceP>
                    <EmergencyStack />
                </VStack>
            </DefaultMain>
            <NavBar activeTab="settings" />
        </SafeArea>
    );
}
