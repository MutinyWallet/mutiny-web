import { A } from "@solidjs/router";
import { Match, Switch } from "solid-js";

import { InfoBox, MegaClock, MegaEx } from "~/components";
import { useI18n } from "~/i18n/context";

export function Failure(props: { reason: string }) {
    const i18n = useI18n();

    return (
        <Switch>
            <Match when={props.reason === "Payment timed out."}>
                <MegaClock />
                <h1 class="mb-2 mt-4 w-full text-center text-2xl font-semibold md:text-3xl">
                    {i18n.t("send.payment_pending")}
                </h1>
                <InfoBox accent="white">
                    {i18n.t("send.payment_pending_description")}
                </InfoBox>
            </Match>
            <Match
                when={props.reason === "Channel reserve amount is too high."}
            >
                <MegaEx />
                <h1 class="mb-2 mt-4 w-full text-center text-2xl font-semibold md:text-3xl">
                    {i18n.t("send.error_channel_reserves")}
                </h1>
                <InfoBox accent="white">
                    {i18n.t("send.error_channel_reserves_explained")}{" "}
                    <A href="/settings/channels">{i18n.t("common.why")}</A>
                </InfoBox>
            </Match>
            <Match when={true}>
                <MegaEx />
                <h1 class="mb-2 mt-4 w-full text-center text-2xl font-semibold md:text-3xl">
                    {props.reason}
                </h1>
            </Match>
        </Switch>
    );
}
