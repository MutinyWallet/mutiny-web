import {
    DeleteEverything,
    ImportExport,
    LoadingIndicator,
    Logs,
    NavBar,
    DefaultMain,
    LargeHeader,
    NiceP,
    SafeArea,
    SmallHeader,
    VStack,
    BackLink
} from "~/components";
import { ExternalLink } from "@mutinywallet/ui";
import { useI18n } from "~/i18n/context";

function EmergencyStack() {
    const i18n = useI18n();
    return (
        <VStack>
            <ImportExport emergency />
            <Logs />
            <div class="rounded-xl p-4 flex flex-col gap-2 bg-m-red overflow-x-hidden">
                <SmallHeader>{i18n.t("settings.danger_zone")}</SmallHeader>
                <DeleteEverything emergency />
            </div>
        </VStack>
    );
}

export default function EmergencyKit() {
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
