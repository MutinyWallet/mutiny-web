import { Title } from "@solidjs/meta";

import { ButtonLink, DefaultMain, LargeHeader } from "~/components";
import { useI18n } from "~/i18n/context";

export function NotFound() {
    const i18n = useI18n();
    return (
        <DefaultMain>
            <Title>{i18n.t("error.not_found.title")}</Title>
            <LargeHeader>{i18n.t("error.not_found.title")}</LargeHeader>
            <p>{i18n.t("error.not_found.wtf_paul")}</p>
            <div class="h-full" />
            <ButtonLink href="/" intent="red">
                {i18n.t("common.dangit")}
            </ButtonLink>
        </DefaultMain>
    );
}
