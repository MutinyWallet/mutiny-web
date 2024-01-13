import { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { Title } from "@solidjs/meta";
import { MonitorSmartphone } from "lucide-solid";
import { createResource, Match, Switch } from "solid-js";

import nodevice from "~/assets/no-device.png";
import {
    Button,
    DefaultMain,
    DeleteEverything,
    ExternalLink,
    ImportExport,
    LargeHeader,
    Logs,
    NiceP,
    SmallHeader
} from "~/components";
import { useI18n } from "~/i18n/context";
import {
    getSettings,
    MutinyWalletSettingStrings
} from "~/logic/mutinyWalletSetup";
import { FeedbackLink } from "~/routes/Feedback";

function ErrorFooter() {
    return (
        <>
            <div class="h-full" />
            <div class="mt-4 self-center">
                <FeedbackLink setupError={true} />
            </div>
        </>
    );
}

export function SetupErrorDisplay(props: {
    initialError: Error;
    password?: string;
}) {
    // Error shouldn't be reactive, so we assign to it so it just gets rendered with the first value
    const i18n = useI18n();
    const error = props.initialError;

    const [lockSeconds, { mutate }] = createResource(async () => {
        if (error.message.startsWith("Mutiny is already running")) {
            const settings: MutinyWalletSettingStrings = await getSettings();
            try {
                const secs = await MutinyWallet.get_device_lock_remaining_secs(
                    props.password,
                    settings.auth,
                    settings.storage
                );
                return Number(secs) || 0;
            } catch (e) {
                console.error(e);
                return 60; // set to 60 if we fail to get the lock time
            }
        } else {
            return 0;
        }
    });

    // Countdown every second if we are displaying the device lock error
    if (error.message.startsWith("Mutiny is already running")) {
        setInterval(async () => {
            const current = lockSeconds();
            if (current !== undefined) {
                if (current > 0) {
                    mutate(current - 1);
                } else {
                    window.location.reload();
                }
            }
        }, 1000);
    }

    return (
        <DefaultMain>
            <Switch>
                <Match
                    when={error.message.startsWith("Network connection closed")}
                >
                    <LargeHeader>
                        {i18n.t("error.on_boot.loading_failed.header")}
                    </LargeHeader>
                    <p class="rounded-xl bg-white/10 p-4 font-mono">
                        <span class="font-bold">{error.name}</span>:{" "}
                        {error.message}
                    </p>
                    <NiceP>
                        {i18n.t("error.on_boot.loading_failed.services_down")}
                    </NiceP>
                    <NiceP>
                        Follow us on{" "}
                        <ExternalLink href="https://primal.net/p/npub1mutnyacc9uc4t5mmxvpprwsauj5p2qxq95v4a9j0jxl8wnkfvuyque23vg">
                            Nostr
                        </ExternalLink>{" "}
                        or{" "}
                        <ExternalLink href="https://twitter.com/MutinyWallet">
                            Twitter
                        </ExternalLink>{" "}
                        for updates.
                    </NiceP>
                    <NiceP>
                        {i18n.t("error.on_boot.loading_failed.in_the_meantime")}{" "}
                        <a href="/?safe_mode=true">
                            {" "}
                            {i18n.t("error.on_boot.loading_failed.safe_mode")}
                        </a>
                        .
                    </NiceP>

                    <ErrorFooter />
                </Match>
                <Match when={error.message.startsWith("Existing tab")}>
                    <Title>{i18n.t("error.on_boot.existing_tab.title")}</Title>
                    <LargeHeader>
                        {i18n.t("error.on_boot.existing_tab.title")}
                    </LargeHeader>
                    <MonitorSmartphone class="mx-auto h-1/4 w-1/4 max-w-[25vh]" />
                    <NiceP>
                        {i18n.t("error.on_boot.existing_tab.description")}
                    </NiceP>
                    <Button onClick={() => window.location.reload()}>
                        {i18n.t("error.reload")}
                    </Button>
                    <ErrorFooter />
                </Match>
                <Match
                    when={error.message.startsWith("Mutiny is already running")}
                >
                    <Title>
                        {i18n.t("error.on_boot.already_running.title")}
                    </Title>
                    <LargeHeader>
                        {i18n.t("error.on_boot.already_running.title")}
                    </LargeHeader>
                    <img
                        src={nodevice}
                        alt="no device"
                        class="mx-auto w-1/4 max-w-[25vh] flex-shrink"
                    />
                    <p class="rounded-xl bg-white/10 p-4 font-mono">
                        <span class="font-bold">{error.name}</span>:{" "}
                        {error.message}
                    </p>
                    <NiceP>
                        {i18n.t("error.on_boot.already_running.description")}
                    </NiceP>
                    <p class="rounded-xl bg-white/10 p-4 font-mono">
                        {i18n.t("error.on_boot.already_running.retry_again_in")}{" "}
                        {lockSeconds()}{" "}
                        {i18n.t("error.on_boot.already_running.seconds")}
                    </p>
                    <Button onClick={() => window.location.reload()}>
                        {i18n.t("error.reload")}
                    </Button>
                    <ErrorFooter />
                </Match>
                <Match when={error.message.startsWith("Browser error")}>
                    <Title>
                        {i18n.t("error.on_boot.incompatible_browser.title")}
                    </Title>
                    <LargeHeader>
                        {i18n.t("error.on_boot.incompatible_browser.header")}
                    </LargeHeader>
                    <p class="rounded-xl bg-white/10 p-4 font-mono">
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
                </Match>
                <Match when={true}>
                    <Title>
                        {i18n.t("error.on_boot.loading_failed.title")}
                    </Title>
                    <LargeHeader>
                        {i18n.t("error.on_boot.loading_failed.header")}
                    </LargeHeader>
                    <p class="rounded-xl bg-white/10 p-4 font-mono">
                        <span class="font-bold">{error.name}</span>:{" "}
                        {error.message}
                    </p>
                    <NiceP>
                        {i18n.t("error.on_boot.loading_failed.description")}
                    </NiceP>
                    <Button onClick={() => window.location.reload()}>
                        {i18n.t("error.reload")}
                    </Button>
                    <NiceP>
                        {i18n.t("error.on_boot.loading_failed.repair_options")}
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
                    <div class="flex flex-col gap-2 rounded-xl bg-m-red p-4">
                        <SmallHeader>
                            {i18n.t("settings.danger_zone")}
                        </SmallHeader>
                        <DeleteEverything emergency />
                    </div>

                    <ErrorFooter />
                </Match>
            </Switch>
        </DefaultMain>
    );
}
