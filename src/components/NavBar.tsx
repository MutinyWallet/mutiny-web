import mutiny_m from '~/assets/icons/m.svg';
import scan from '~/assets/icons/scan.svg';
import settings from '~/assets/icons/settings.svg';

import { A } from "solid-start";

type ActiveTab = 'home' | 'scan' | 'settings' | 'none';

export default function NavBar(props: { activeTab: ActiveTab }) {
    const activeStyle = 'h-full border-t-2 border-b-2 border-b-black flex flex-col justify-center'
    return (<nav class='bg-black fixed bottom-0 shadow-lg z-40 w-full safe-bottom'>
        <ul class='h-16 flex justify-between px-16 items-center'>
            <li class={props.activeTab === "home" ? activeStyle : ""}>
                <A href="/">
                    <img src={mutiny_m} alt="home" />
                </A>
            </li>
            <li class={props.activeTab === "scan" ? activeStyle : ""}>
                <A href="/scanner">
                    <img src={scan} alt="scan" />
                </A>
            </li>
            <li class={props.activeTab === "settings" ? activeStyle : ""}>
                <A href="/settings">
                    <img src={settings} alt="settings" />
                </A>
            </li>
        </ul>
    </nav>)
}