import { useLocation, useNavigate } from "@solidjs/router";
import { JSXElement } from "solid-js";

import { BackButton } from "~/components";
import { useI18n } from "~/i18n/context";

export type StateWithPrevious = {
    previous?: string;
};

export function BackPop(props: { default: string; title?: string }) {
    const i18n = useI18n();
    const navigate = useNavigate();
    const location = useLocation();

    function getBackPath() {
        const state = location.state as StateWithPrevious;

        // If there's no previous state want to just go back one level, basically ../
        const newBackPath = props.default
            ? props.default
            : location.pathname.split("/").slice(0, -1).join("/");

        const backPath = state?.previous ? state?.previous : newBackPath;
        return backPath;
    }

    const backPath = () => getBackPath();

    return (
        <BackButton
            title={
                props.title !== undefined
                    ? props.title
                    : backPath() === "/"
                    ? i18n.t("common.home")
                    : i18n.t("common.back")
            }
            onClick={() => navigate(backPath())}
            showOnDesktop
        />
    );
}

export function UnstyledBackPop(props: {
    default: string;
    children: JSXElement;
}) {
    const i18n = useI18n();
    const navigate = useNavigate();
    const location = useLocation();

    function getBackPath() {
        const state = location.state as StateWithPrevious;

        // If there's no previous state want to just go back one level, basically ../
        const newBackPath = props.default
            ? props.default
            : location.pathname.split("/").slice(0, -1).join("/");

        const backPath = state?.previous ? state?.previous : newBackPath;
        return backPath;
    }

    const backPath = () => getBackPath();

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
