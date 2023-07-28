import { Title } from "solid-start";
import {
    DefaultMain,
    LargeHeader,
    NiceP,
    SafeArea,
    SmallHeader
} from "~/components/layout";
import { ExternalLink } from "./layout/ExternalLink";
import { Match, Switch } from "solid-js";
import { ImportExport } from "./ImportExport";
import { Logs } from "./Logs";
import { DeleteEverything } from "./DeleteEverything";
import { FeedbackLink } from "~/routes/Feedback";
import { useI18n } from "~/i18n/context";

function ErrorFooter() {
    return (
        <>
            <div class="h-full" />
            <div class="self-center mt-4">
                <FeedbackLink setupError={true} />
            </div>
        </>
    );
}

export default function SetupErrorDisplay(props: { initialError: Error }) {
    // Error shouldn't be reactive, so we assign to it so it just gets rendered with the first value
    const i18n = useI18n();
    const error = props.initialError;

    return (
        <SafeArea>
            <Switch>
                <Match when={error.message.startsWith("Existing tab")}>
                    <Title>{i18n.t("error.on_boot.existing_tab.title")}</Title>
                    <DefaultMain>
                        <LargeHeader>
                            {i18n.t("error.on_boot.existing_tab.title")}
                        </LargeHeader>
                        <p class="bg-white/10 rounded-xl p-4 font-mono">
                            <span class="font-bold">{error.name}</span>:{" "}
                            {error.message}
                        </p>
                        <NiceP>
                            {i18n.t("error.on_boot.existing_tab.description")}
                        </NiceP>
                        <ErrorFooter />
                    </DefaultMain>
                </Match>
                <Match when={error.message.startsWith("Browser error")}>
                    <Title>
                        {i18n.t("error.on_boot.incompatible_browser.title")}
                    </Title>
                    <DefaultMain>
                        <LargeHeader>
                            {i18n.t(
                                "error.on_boot.incompatible_browser.header"
                            )}
                        </LargeHeader>
                        <p class="bg-white/10 rounded-xl p-4 font-mono">
                            <span class="font-bold">{error.name}</span>:{" "}
                            {error.message}
                        </p>
                        <NiceP>
                            {i18n.t(
                                "error.on_boot.incompatible_browser.description"
                            )}
                        </NiceP>
                        <NiceP>
                            {i18n.t(
                                "error.on_boot.incompatible_browser.try_different_browser"
                            )}
                        </NiceP>
                        <NiceP>
                            {i18n.t(
                                "error.on_boot.incompatible_browser.browser_storage"
                            )}
                        </NiceP>
                        <ExternalLink href="https://github.com/MutinyWallet/mutiny-web/wiki/Browser-Compatibility">
                            {i18n.t(
                                "error.on_boot.incompatible_browser.browsers_link"
                            )}
                        </ExternalLink>

                        <ErrorFooter />
                    </DefaultMain>
                </Match>
                <Match when={true}>
                    <Title>
                        {i18n.t("error.on_boot.loading_failed.title")}
                    </Title>
                    <DefaultMain>
                        <LargeHeader>
                            {i18n.t("error.on_boot.loading_failed.header")}
                        </LargeHeader>
                        <p class="bg-white/10 rounded-xl p-4 font-mono">
                            <span class="font-bold">{error.name}</span>:{" "}
                            {error.message}
                        </p>
                        <NiceP>
                            {i18n.t("error.on_boot.loading_failed.description")}
                        </NiceP>
                        <NiceP>
                            {i18n.t(
                                "error.on_boot.loading_failed.repair_options"
                            )}
                        </NiceP>
                        <NiceP>
                            {i18n.t("error.on_boot.loading_failed.questions")}{" "}
                            <ExternalLink href="https://matrix.to/#/#mutiny-community:lightninghackers.com">
                                {i18n.t(
                                    "error.on_boot.loading_failed.support_link"
                                )}
                            </ExternalLink>
                        </NiceP>
                        <ImportExport emergency />
                        <Logs />
                        <div class="rounded-xl p-4 flex flex-col gap-2 bg-m-red">
                            <SmallHeader>
                                {i18n.t("settings.danger_zone")}
                            </SmallHeader>
                            <DeleteEverything emergency />
                        </div>

                        <ErrorFooter />
                    </DefaultMain>
                </Match>
            </Switch>
        </SafeArea>
    );
}
