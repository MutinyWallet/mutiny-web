import { A } from "@solidjs/router";
import {
    ArrowDownLeft,
    ArrowUpRight,
    Scan,
    Settings,
    User,
    Wallet
} from "lucide-solid";
import { JSX } from "solid-js";

type ActiveTab =
    | "home"
    | "scan"
    | "send"
    | "receive"
    | "settings"
    | "profile"
    | "none";

function NavBarItem(props: {
    href: string;
    icon: JSX.Element;
    active: boolean;
}) {
    return (
        <li>
            <A
                class="block rounded-lg p-2"
                href={props.href}
                classList={{
                    "hover:bg-white/20 active:bg-white/10 active:mt-[2px] active:-mb-[2px]":
                        !props.active,
                    "bg-m-red": props.active
                }}
            >
                {props.icon}
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
                    icon={<Wallet class="h-8 w-8" />}
                    active={props.activeTab === "home"}
                />
                <NavBarItem
                    href="/search"
                    icon={<ArrowUpRight class="h-8 w-8" />}
                    active={props.activeTab === "send"}
                />
                <NavBarItem
                    href="/receive"
                    icon={<ArrowDownLeft class="h-8 w-8" />}
                    active={props.activeTab === "receive"}
                />
                <NavBarItem
                    href="/scanner"
                    icon={<Scan class="h-8 w-8" />}
                    active={false}
                />
                <NavBarItem
                    href="/profile"
                    icon={<User class="h-8 w-8" />}
                    active={props.activeTab === "profile"}
                />
                <NavBarItem
                    href="/settings"
                    icon={<Settings class="h-8 w-8" />}
                    active={props.activeTab === "settings"}
                />
            </ul>
        </nav>
    );
}
