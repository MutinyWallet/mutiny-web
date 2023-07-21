import { useLocation, useNavigate } from "solid-start";
import { BackButton } from "./BackButton";
import { useI18n } from "~/i18n/context";

type StateWithPrevious = {
    previous?: string;
};

export function BackPop() {
    const i18n = useI18n();
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state as StateWithPrevious;

    const backPath = () => (state?.previous ? state?.previous : "/");

    return (
        <BackButton
            title={i18n.t("common.back")}
            onClick={() => navigate(backPath())}
            showOnDesktop
        />
    );
}
