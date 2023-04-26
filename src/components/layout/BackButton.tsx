import { A } from "solid-start";
import { Back } from "~/assets/svg/Back";

export function BackButton(props: { href?: string, title?: string }) {
    return (<A href={props.href ? props.href : "/"} class="text-m-red active:text-m-red/80 text-xl font-semibold no-underline md:hidden flex items-center"><Back />{props.title ? props.title : "Home"}</A>)
}