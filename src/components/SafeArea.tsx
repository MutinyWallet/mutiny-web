import { JSX } from "solid-js";

export default function SafeArea(props: { children: JSX.Element }) {
    return (
        <div class="safe-top safe-left safe-right safe-bottom">
            <div class="disable-scrollbars max-h-screen h-full overflow-y-scroll md:pl-[8rem] md:pr-[6rem]">
                {props.children}
            </div>
        </div >
    )
}