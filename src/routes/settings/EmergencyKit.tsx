import {
    BackLink,
    Button,
    DefaultMain,
    DeleteEverything,
    ExternalLink,
    ImportExport,
    InnerCard,
    LargeHeader,
    LoadingIndicator,
    Logs,
    NavBar,
    NiceP,
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
            <InnerCard title={"Safe Mode"}>
                <VStack>
                    <NiceP>
                        Disable certain wallet functionality to help with
                        debugging.
                    </NiceP>
                    <Button
                        onClick={() =>
                            (window.location.href = "/?safe_mode=true")
                        }
                    >
                        Enable Safe Mode
                    </Button>
                </VStack>
            </InnerCard>
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
        <DefaultMain>
            <BackLink href="/settings" title={i18n.t("settings.header")} />
            <LargeHeader>{i18n.t("settings.emergency_kit.title")}</LargeHeader>
            <VStack>
                <LoadingIndicator />
                <NiceP>{i18n.t("settings.emergency_kit.emergency_tip")}</NiceP>
                <NiceP>
                    {i18n.t("settings.emergency_kit.questions")}{" "}
                    <ExternalLink href="https://discord.gg/x3njeHUjVd">
                        {i18n.t("settings.emergency_kit.link")}
                    </ExternalLink>
                </NiceP>
                <EmergencyStack />
            </VStack>
            <NavBar activeTab="settings" />
        </DefaultMain>
    );
}
