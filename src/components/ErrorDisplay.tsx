import { A, Title } from "solid-start";
import {
    Button,
    DefaultMain,
    LargeHeader,
    NiceP,
    SafeArea,
    SmallHeader
} from "~/components/layout";
import { ExternalLink } from "./layout/ExternalLink";
import { useI18n } from "~/i18n/context";

export default function ErrorDisplay(props: { error: Error }) {
    const i18n = useI18n();
    return (
        <SafeArea>
            <Title>{i18n.t("error.general.oh_no")}</Title>
            <DefaultMain>
                <LargeHeader>{i18n.t("error.title")}</LargeHeader>
                <SmallHeader>
                    {i18n.t("error.general.never_should_happen")}
                </SmallHeader>
                <p class="bg-white/10 rounded-xl p-4 font-mono">
                    <span class="font-bold">{props.error.name}</span>:{" "}
                    {props.error.message}
                </p>
                <NiceP>
                    {i18n.t("error.general.try_reloading")}{" "}
                    <ExternalLink href="https://matrix.to/#/#mutiny-community:lightninghackers.com">
                        {i18n.t("error.general.support_link")}
                    </ExternalLink>
                </NiceP>
                <NiceP>
                    {i18n.t("error.general.getting_desperate")}{" "}
                    <A href="/emergencykit">{i18n.t("error.emergency_link")}</A>
                </NiceP>
                <div class="h-full" />
                <Button
                    onClick={() => (window.location.href = "/")}
                    intent="red"
                >
                    {i18n.t("common.dangit")}
                </Button>
            </DefaultMain>
        </SafeArea>
    );
}
