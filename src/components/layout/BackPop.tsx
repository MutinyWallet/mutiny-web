import { useLocation, useNavigate } from "@solidjs/router";
import { JSXElement } from "solid-js";

import { BackButton } from "~/components";
import { useI18n } from "~/i18n/context";

type StateWithPrevious = {
    previous?: string;
};

export function BackPop() {
    const i18n = useI18n();
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state as StateWithPrevious;

    // If there's no previous state want to just go back one level, basically ../
    const newBackPath = location.pathname.split("/").slice(0, -1).join("/");

    const backPath = () => (state?.previous ? state?.previous : newBackPath);

    return (
        <BackButton
            title={
                backPath() === "/"
                    ? i18n.t("common.home")
                    : i18n.t("common.back")
            }
            onClick={() => navigate(backPath())}
            showOnDesktop
        />
    );
}

export function UnstyledBackPop(props: { children: JSXElement }) {
    const i18n = useI18n();
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state as StateWithPrevious;

    // If there's no previous state want to just go back one level, basically ../
    const newBackPath = location.pathname.split("/").slice(0, -1).join("/");

    const backPath = () => (state?.previous ? state?.previous : newBackPath);

    return (
        <button
            title={
                backPath() === "/"
                    ? i18n.t("common.home")
                    : i18n.t("common.back")
            }
            onClick={() => {
                console.log("backPath", backPath());
                navigate(backPath());
            }}
        >
            {props.children}
        </button>
    );
}
