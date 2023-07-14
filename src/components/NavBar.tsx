import mutiny_m from "~/assets/icons/m.svg";
import airplane from "~/assets/icons/airplane.svg";
import settings from "~/assets/icons/settings.svg";
import receive from "~/assets/icons/big-receive.svg";
import redshift from "~/assets/icons/rs.svg";
import userClock from "~/assets/icons/user-clock.svg";

import { A } from "solid-start";

type ActiveTab =
    | "home"
    | "scan"
    | "send"
    | "receive"
    | "settings"
    | "redshift"
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

export default function NavBar(props: { activeTab: ActiveTab }) {
    return (
        <nav class="hidden md:block fixed shadow-none z-40 safe-bottom top-0 bottom-auto left-0 h-full">
            <ul class="flex flex-col justify-start gap-4 px-4 mt-4">
                <NavBarItem
                    href="/"
                    icon={mutiny_m}
                    active={props.activeTab === "home"}
                    alt="home"
                />
                <NavBarItem
                    href="/send"
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
                    href="/redshift"
                    icon={redshift}
                    active={props.activeTab === "redshift"}
                    alt="redshift"
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
