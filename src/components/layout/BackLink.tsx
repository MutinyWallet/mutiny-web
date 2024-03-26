import { A } from "@solidjs/router";
import { ChevronLeft } from "lucide-solid";

import { useI18n } from "~/i18n/context";

export function BackLink(props: {
    href?: string;
    title?: string;
    showOnDesktop?: boolean;
}) {
    const i18n = useI18n();
    return (
        <A
            href={props.href ? props.href : "/"}
            class="-mx-2 flex items-center text-xl font-semibold text-white no-underline active:-mb-[1px] active:mt-[1px] active:text-white/80 md:hidden"
            classList={{ "md:!flex": props.showOnDesktop }}
        >
            <ChevronLeft class="h-7 w-7" />
            {props.title ? props.title : i18n.t("common.home")}
        </A>
    );
}

export function BackButton(props: {
    onClick: () => void;
    title?: string;
    showOnDesktop?: boolean;
}) {
    const i18n = useI18n();
    return (
        <button
            onClick={() => props.onClick()}
            class="-mx-2 flex items-center text-xl font-semibold text-white no-underline active:-mb-[1px] active:mt-[1px] active:text-white/80 md:hidden"
            classList={{ "md:!flex": props.showOnDesktop }}
        >
            <ChevronLeft class="h-7 w-7" />
            {props.title !== undefined ? props.title : i18n.t("common.home")}
        </button>
    );
}
