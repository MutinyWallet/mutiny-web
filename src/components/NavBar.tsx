import { A } from "@solidjs/router";

import airplane from "~/assets/icons/airplane.svg";
import receive from "~/assets/icons/big-receive.svg";
import mutiny_m from "~/assets/icons/m.svg";
import scan from "~/assets/icons/scan.svg";
import settings from "~/assets/icons/settings.svg";
import userClock from "~/assets/icons/user-clock.svg";

type ActiveTab =
    | "home"
    | "scan"
    | "send"
    | "receive"
    | "settings"
    | "activity"
    | "none";

function NavBarItem(props: {
    href: string;
    icon: string;
    active: boolean;
    alt: string;
}) {
    return (
        <li>
            <A
                class="block rounded-lg p-2"
                href={props.href}
                classList={{
                    "hover:bg-white/5 active:bg-m-blue": !props.active,
                    "bg-black": props.active
                }}
            >
                <img src={props.icon} alt={props.alt} height={36} width={36} />
            </A>
        </li>
    );
}

export function NavBar(props: { activeTab: ActiveTab }) {
    return (
        <nav class="fixed bottom-auto left-0 top-0 z-40 hidden h-full shadow-none safe-bottom md:block">
            <ul class="mt-4 flex flex-col justify-start gap-4 px-4">
                <NavBarItem
                    href="/"
                    icon={mutiny_m}
                    active={props.activeTab === "home"}
                    alt="home"
                />
                <NavBarItem
                    href="/search"
                    icon={airplane}
                    active={props.activeTab === "send"}
                    alt="send"
                />
                <NavBarItem
                    href="/receive"
                    icon={receive}
                    active={props.activeTab === "receive"}
                    alt="receive"
                />
                <NavBarItem
                    href="/activity"
                    icon={userClock}
                    active={props.activeTab === "activity"}
                    alt="activity"
                />
                <NavBarItem
                    href="/scanner"
                    icon={scan}
                    active={false}
                    alt="scan"
                />
                <NavBarItem
                    href="/settings"
                    icon={settings}
                    active={props.activeTab === "settings"}
                    alt="settings"
                />
            </ul>
        </nav>
    );
}
