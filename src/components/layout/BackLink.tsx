import { A } from "@solidjs/router";

import { Back } from "~/assets/svg/Back";
import { useI18n } from "~/i18n/context";

export function BackLink(props: { href?: string; title?: string }) {
    const i18n = useI18n();
    return (
        <A
            href={props.href ? props.href : "/"}
            class="flex items-center text-xl font-semibold text-m-red no-underline active:text-m-red/80 md:hidden"
        >
            <Back />
            {props.title ? props.title : i18n.t("common.home")}
        </A>
    );
}
