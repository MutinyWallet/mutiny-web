import { DeleteEverything } from "~/components/DeleteEverything";
import { ImportExport } from "~/components/ImportExport";
import { LoadingIndicator } from "~/components/LoadingIndicator";
import { Logs } from "~/components/Logs";
import NavBar from "~/components/NavBar";
import {
    DefaultMain,
    LargeHeader,
    NiceP,
    SafeArea,
    SmallHeader,
    VStack
} from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import { ExternalLink } from "~/components/layout/ExternalLink";
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
