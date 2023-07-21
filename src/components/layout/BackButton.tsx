import { Back } from "~/assets/svg/Back";
import { useI18n } from "~/i18n/context";

export function BackButton(props: {
    onClick: () => void;
    title?: string;
    showOnDesktop?: boolean;
}) {
    const i18n = useI18n();
    return (
        <button
            onClick={() => props.onClick()}
            class="text-m-red active:text-m-red/80 text-xl font-semibold no-underline md:hidden flex items-center"
            classList={{ "md:!flex": props.showOnDesktop }}
        >
            <Back />
            {props.title ? props.title : i18n.t("common.home")}
        </button>
    );
}
