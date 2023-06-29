import {
    DefaultMain,
    LargeHeader,
    MutinyWalletGuard,
    SafeArea,
    SettingsCard,
    VStack
} from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import NavBar from "~/components/NavBar";
import { A } from "solid-start";
import { For, Show } from "solid-js";
import forward from "~/assets/icons/forward.svg";

function SettingsLinkList(props: {
    header: string;
    links: {
        href: string;
        text: string;
        caption?: string;
        accent?: "red" | "green";
    }[];
}) {
    return (
        <SettingsCard title={props.header}>
            <For each={props.links}>
                {(link) => (
                    <A
                        href={link.href}
                        class="no-underline flex w-full flex-col gap-1 py-2 hover:bg-m-grey-750 active:bg-m-grey-900 px-4 "
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
    return (
        <SafeArea>
            <DefaultMain>
                <BackLink />
                <LargeHeader>Settings</LargeHeader>
                <VStack biggap>
                    <SettingsLinkList
                        header="General"
                        links={[
                            {
                                href: "/settings/channels",
                                text: "Lightning Channels"
                            },
                            {
                                href: "/settings/backup",
                                text: "Backup",
                                accent: "green"
                            },
                            {
                                href: "/settings/servers",
                                text: "Servers",
                                caption:
                                    "Don't trust us! Use your own servers to back Mutiny."
                            }
                        ]}
                    />
                    <SettingsLinkList
                        header="Beta Features"
                        links={[
                            {
                                href: "/settings/connections",
                                text: "Wallet Connections"
                            },
                            {
                                href: "/settings/lnurlauth",
                                text: "LNURL Auth"
                            }
                        ]}
                    />
                    <SettingsLinkList
                        header="Debug Tools"
                        links={[
                            {
                                href: "/settings/emergencykit",
                                text: "Emergency Kit",
                                caption:
                                    "Diagnose and solve problems with your wallet."
                            },
                            {
                                href: "/settings/admin",
                                text: "Admin Page",
                                caption:
                                    "Our internal debug tools. Use wisely!",
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
