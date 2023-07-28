import { Title } from "solid-start";
import { HttpStatusCode } from "solid-start/server";
import {
    ButtonLink,
    DefaultMain,
    LargeHeader,
    SafeArea
} from "~/components/layout";
import { useI18n } from "~/i18n/context";

export default function NotFound() {
    const i18n = useI18n();
    return (
        <SafeArea>
            <Title>{i18n.t("error.not_found.title")}</Title>
            <HttpStatusCode code={404} />
            <DefaultMain>
                <LargeHeader>{i18n.t("error.not_found.title")}</LargeHeader>
                <p>{i18n.t("error.not_found.wtf_paul")}</p>
                <div class="h-full" />
                <ButtonLink href="/" intent="red">
                    {i18n.t("common.dangit")}
                </ButtonLink>
            </DefaultMain>
        </SafeArea>
    );
}
