import mutiny_m from '~/assets/icons/m.svg';
import airplane from '~/assets/icons/airplane.svg';
import settings from '~/assets/icons/settings.svg';
import receive from '~/assets/icons/big-receive.svg';
import redshift from '~/assets/icons/rs.svg';
import userClock from '~/assets/icons/user-clock.svg';

import { A } from "solid-start";

type ActiveTab = 'home' | 'scan' | 'send' | 'receive' | 'settings' | 'redshift' | 'activity' | 'none';

export default function NavBar(props: { activeTab: ActiveTab }) {
    const activeStyle = 'border-t-0 border-b-0 p-2 bg-black rounded-lg'
    const inactiveStyle = "p-2 hover:bg-white/5 rounded-lg active:bg-m-blue"
    return (
        <nav class='hidden md:block fixed shadow-none z-40 safe-bottom top-0 bottom-auto left-0 h-full'>
            <ul class='h-16 flex flex-col justify-start gap-4 px-4 mt-4'>
                <li class={props.activeTab === "home" ? activeStyle : inactiveStyle}>
                    <A href="/">
                        <img src={mutiny_m} alt="home" />
                    </A>
                </li>
                <li class={props.activeTab === "send" ? activeStyle : inactiveStyle}>
                    <A href="/send">
                        <img src={airplane} alt="send" />
                    </A>
                </li>
                <li class={props.activeTab === "receive" ? activeStyle : inactiveStyle}>
                    <A href="/receive">
                        <img src={receive} alt="receive" />
                    </A>
                </li>
                <li class={props.activeTab === "activity" ? activeStyle : inactiveStyle}>
                    <A href="/activity">
                        <img src={userClock} alt="activity" />
                    </A>
                </li>
                <li class={props.activeTab === "settings" ? activeStyle : inactiveStyle}>
                    <A href="/settings">
                        <img src={settings} alt="settings" />
                    </A>
                </li>
                <li class={props.activeTab === "redshift" ? activeStyle : inactiveStyle}>
                    <A href="/redshift">
                        <img src={redshift} alt="redshift" width={36} />
                    </A>
                </li>
            </ul>
        </nav >
    )
}