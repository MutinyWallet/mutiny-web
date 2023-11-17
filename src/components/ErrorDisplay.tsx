import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { onMount } from "solid-js";

import { ExternalLink } from "~/components";
import {
    Button,
    DefaultMain,
    LargeHeader,
    NiceP,
    SafeArea,
    SmallHeader
} from "~/components/layout";
import { useI18n } from "~/i18n/context";

export function SimpleErrorDisplay(props: { error: Error }) {
    return (
        <p class="rounded-xl bg-white/10 p-4 font-mono">
            <span class="font-bold">{props.error.name}</span>:{" "}
            {props.error.message}
        </p>
    );
}

export function ErrorDisplay(props: { error: Error }) {
    const i18n = useI18n();
    onMount(() => {
        console.error(props.error);
    });
    return (
        <SafeArea>
            <Title>{i18n.t("error.general.oh_no")}</Title>
            <DefaultMain>
                <LargeHeader>{i18n.t("error.title")}</LargeHeader>
                <SmallHeader>
                    {i18n.t("error.general.never_should_happen")}
                </SmallHeader>
                <SimpleErrorDisplay error={props.error} />
                <NiceP>
                    {i18n.t("error.general.try_reloading")}{" "}
                    <ExternalLink href="https://matrix.to/#/#mutiny-community:lightninghackers.com">
                        {i18n.t("error.general.support_link")}
                    </ExternalLink>
                </NiceP>
                <Button onClick={() => window.location.reload()}>
                    {i18n.t("error.reload")}
                </Button>
                <NiceP>
                    {i18n.t("error.general.getting_desperate")}{" "}
                    <A href="/settings/emergencykit">
                        {i18n.t("error.emergency_link")}
                    </A>
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
