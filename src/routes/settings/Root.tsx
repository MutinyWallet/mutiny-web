import { Capacitor } from "@capacitor/core";
import { A } from "@solidjs/router";
import { ChevronRight } from "lucide-solid";
import { For, Show } from "solid-js";

import {
    BackLink,
    DefaultMain,
    ExternalLink,
    LargeHeader,
    MutinyPlusCta,
    NavBar,
    SettingsCard,
    TinyText,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { FeedbackLink } from "~/routes/Feedback";
import { useMegaStore } from "~/state/megaStore";

function SettingsLinkList(props: {
    header: string;
    links: {
        href: string;
        text: string;
        caption?: string;
        accent?: "red" | "green";
        disabled?: boolean;
    }[];
}) {
    return (
        <SettingsCard title={props.header}>
            <For each={props.links}>
                {(link) => (
                    <A
                        href={link.href}
                        class="flex w-full flex-col gap-1 px-4 py-2 no-underline hover:bg-m-grey-750 active:bg-m-grey-900"
                        classList={{
                            "opacity-50 cursor pointer-events-none grayscale":
                                link.disabled
                        }}
                    >
                        <div class="flex justify-between">
                            <span
                                classList={{
                                    "text-m-red": link.accent === "red",
                                    "text-m-green": link.accent === "green"
                                }}
                            >
                                {link.text}
                            </span>
                            <ChevronRight />
                        </div>
                        <Show when={link.caption}>
                            <div class="text-sm text-m-grey-400">
                                {link.caption}
                            </div>
                        </Show>
                    </A>
                )}
            </For>
        </SettingsCard>
    );
}

export function Settings() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const RELEASE_VERSION = import.meta.env.__RELEASE_VERSION__;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const COMMIT_HASH = import.meta.env.__COMMIT_HASH__;

    const selfHosted = state.settings?.selfhosted === "true";

    const ios = Capacitor.getPlatform() === "ios";

    return (
        <DefaultMain>
            <BackLink />
            <LargeHeader>{i18n.t("settings.header")}</LargeHeader>
            <VStack biggap>
                <Show when={state.mutiny_plus || (!selfHosted && !ios)}>
                    <MutinyPlusCta />
                </Show>
                <SettingsLinkList
                    header={i18n.t("settings.general")}
                    links={[
                        {
                            href: "/settings/channels",
                            text: i18n.t("settings.channels.title")
                        },
                        {
                            href: "/settings/backup",
                            text: i18n.t("settings.backup.title"),
                            accent: "green"
                        },
                        {
                            href: "/settings/restore",
                            text: i18n.t("settings.restore.title"),
                            accent: "red"
                        },
                        {
                            href: "/settings/encrypt",
                            text: i18n.t("settings.encrypt.title"),
                            disabled: !state.has_backed_up,
                            caption: !state.has_backed_up
                                ? i18n.t("settings.encrypt.caption")
                                : undefined
                        },

                        {
                            href: "/settings/servers",
                            text: i18n.t("settings.servers.title"),
                            caption: i18n.t("settings.servers.caption")
                        }
                    ]}
                />
                <SettingsLinkList
                    header={i18n.t("settings.appearance")}
                    links={[
                        {
                            href: "/settings/currency",
                            text: i18n.t("settings.currency.title"),
                            caption: i18n.t("settings.currency.caption")
                        },
                        {
                            href: "/settings/language",
                            text: i18n.t("settings.language.title"),
                            caption: i18n.t("settings.language.caption")
                        }
                    ]}
                />
                <SettingsLinkList
                    header={i18n.t("settings.social")}
                    links={[
                        {
                            href: "/settings/nostrkeys",
                            text: i18n.t("settings.nostr_keys.title"),
                            caption: i18n.t("settings.nostr_keys.caption")
                        }
                    ]}
                />
                <SettingsLinkList
                    header={i18n.t("settings.debug_tools")}
                    links={[
                        {
                            href: "/settings/emergencykit",
                            text: i18n.t("settings.emergency_kit.title"),
                            caption: i18n.t("settings.emergency_kit.caption")
                        },
                        {
                            href: "/settings/admin",
                            text: i18n.t("settings.admin.title"),
                            caption: i18n.t("settings.admin.caption"),
                            accent: "red"
                        }
                    ]}
                />
                <div class="flex justify-center">
                    <FeedbackLink />
                </div>
                <div class="flex justify-center pb-8">
                    <TinyText>
                        {i18n.t("settings.version")} {RELEASE_VERSION}{" "}
                        <ExternalLink
                            href={`https://github.com/MutinyWallet/mutiny-web/commits/${COMMIT_HASH}`}
                        >
                            {COMMIT_HASH}
                        </ExternalLink>
                    </TinyText>
                </div>
            </VStack>
            <NavBar activeTab="settings" />
        </DefaultMain>
    );
}
