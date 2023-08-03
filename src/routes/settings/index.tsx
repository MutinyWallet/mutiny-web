import {
    DefaultMain,
    LargeHeader,
    SafeArea,
    SettingsCard,
    VStack
} from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import NavBar from "~/components/NavBar";
import { A } from "solid-start";
import { For, Show } from "solid-js";
import forward from "~/assets/icons/forward.svg";
import { useI18n } from "~/i18n/context";
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
                        class="no-underline flex w-full flex-col gap-1 py-2 hover:bg-m-grey-750 active:bg-m-grey-900 px-4"
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
                            <img src={forward} alt="go" />
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

export default function Settings() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    return (
        <SafeArea>
            <DefaultMain>
                <BackLink />
                <LargeHeader>{i18n.t("settings.header")}</LargeHeader>
                <VStack biggap>
                    <SettingsLinkList
                        header={i18n.t("settings.plus.title")}
                        links={[
                            {
                                href: "/settings/plus",
                                text: i18n.t("settings.support")
                            }
                        ]}
                    />
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
                                text: "Change Password",
                                disabled: !state.has_backed_up,
                                caption: !state.has_backed_up
                                    ? "Backup first to unlock encryption"
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
                        header={i18n.t("settings.beta_features")}
                        links={[
                            {
                                href: "/settings/connections",
                                text: i18n.t("settings.connections.title")
                            },
                            {
                                href: "/settings/lnurlauth",
                                text: i18n.t("settings.lnurl_auth.title")
                            }
                        ]}
                    />
                    <SettingsLinkList
                        header={i18n.t("settings.debug_tools")}
                        links={[
                            {
                                href: "/settings/emergencykit",
                                text: i18n.t("settings.emergency_kit.title"),
                                caption: i18n.t(
                                    "settings.emergency_kit.caption"
                                )
                            },
                            {
                                href: "/settings/admin",
                                text: i18n.t("settings.admin.title"),
                                caption: i18n.t("settings.admin.caption"),
                                accent: "red"
                            }
                        ]}
                    />
                </VStack>
            </DefaultMain>
            <NavBar activeTab="settings" />
        </SafeArea>
    );
}
