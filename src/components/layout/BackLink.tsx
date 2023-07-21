import { A } from "solid-start";
import { Back } from "~/assets/svg/Back";
import { useI18n } from "~/i18n/context";

export function BackLink(props: { href?: string; title?: string }) {
    const i18n = useI18n();
    return (
        <A
            href={props.href ? props.href : "/"}
            class="text-m-red active:text-m-red/80 text-xl font-semibold no-underline md:hidden flex items-center"
        >
            <Back />
            {props.title ? props.title : i18n.t("common.home")}
        </A>
    );
}
