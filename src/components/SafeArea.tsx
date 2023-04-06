import { JSX } from "solid-js";

export default function SafeArea(props: { children: JSX.Element }) {
    return (
        <div class="safe-top safe-left safe-right safe-bottom">
            <div class="disable-scrollbars max-h-screen h-full overflow-y-scroll">
                {props.children}
            </div>
        </div >
    )
}