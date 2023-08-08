import {
    Match,
    Show,
    Suspense,
    Switch,
    createResource,
    createSignal
} from "solid-js";
import { A } from "solid-start";
import { ConfirmDialog } from "~/components/Dialog";
import { InfoBox } from "~/components/InfoBox";
import NavBar from "~/components/NavBar";
import {
    Button,
    DefaultMain,
    FancyCard,
    LargeHeader,
    MutinyWalletGuard,
    NiceP,
    SafeArea,
    TinyText,
    VStack
} from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import { useMegaStore } from "~/state/megaStore";
import eify from "~/utils/eify";
import party from "~/assets/party.gif";
import { LoadingShimmer } from "~/components/BalanceBox";
import { useI18n } from "~/i18n/context";
import { subscriptionValid } from "~/utils/subscriptions";

function Perks(props: { alreadySubbed?: boolean }) {
    const i18n = useI18n();
    return (
        <ul class="list-disc ml-8 font-light text-lg">
            <Show when={props.alreadySubbed}>
                <li>{i18n.t("settings.plus.satisfaction")}</li>
            </Show>
            <li>
                {i18n.t("redshift.title")}{" "}
                <em>{i18n.t("common.coming_soon")}</em>
            </li>
            <li>
                {i18n.t("settings.plus.gifting")}{" "}
                <em>{i18n.t("common.coming_soon")}</em>
            </li>
            <li>
                {i18n.t("settings.plus.multi_device")}{" "}
                <em>{i18n.t("common.coming_soon")}</em>
            </li>
            <li>{i18n.t("settings.plus.more")}</li>
        </ul>
    );
}

function PlusCTA() {
    const i18n = useI18n();
    const [state, actions] = useMegaStore();

    const [subbing, setSubbing] = createSignal(false);
    const [confirmOpen, setConfirmOpen] = createSignal(false);
    const [restoring, setRestoring] = createSignal(false);

    const [error, setError] = createSignal<Error>();

    const [planDetails] = createResource(async () => {
        try {
            const plans = await state.mutiny_wallet?.get_subscription_plans();
            console.log("plans:", plans);
            if (!plans) return undefined;
            return plans[0];
        } catch (e) {
            console.error(e);
        }
    });

    async function handleConfirm() {
        try {
            setSubbing(true);
            setError(undefined);

            if (planDetails()?.id === undefined || planDetails()?.id === null)
                throw new Error(i18n.t("settings.plus.error_no_plan"));

            const invoice = await state.mutiny_wallet?.subscribe_to_plan(
                planDetails().id
            );

            if (!invoice?.bolt11)
                throw new Error(i18n.t("settings.plus.error_failure"));

            await state.mutiny_wallet?.pay_subscription_invoice(
                invoice?.bolt11
            );

            // "true" flag gives this a fallback to set a timestamp in case the subscription server is down
            await actions.checkForSubscription(true);
        } catch (e) {
            console.error(e);
            setError(eify(e));
        } finally {
            setConfirmOpen(false);
            setSubbing(false);
        }
    }

    async function restore() {
        try {
            setError(undefined);
            setRestoring(true);
            await actions.checkForSubscription();
            if (!state.subscription_timestamp) {
                setError(
                    new Error(i18n.t("settings.plus.error_no_subscription"))
                );
            }

            if (!subscriptionValid(state.subscription_timestamp)) {
                setError(
                    new Error(
                        i18n.t("settings.plus.error_expired_subscription")
                    )
                );
            }
        } catch (e) {
            console.error(e);
            setError(eify(e));
        } finally {
            setRestoring(false);
        }
    }

    const hasEnough = () => {
        if (!planDetails()) return false;
        return (state.balance?.lightning || 0n) > planDetails().amount_sat;
    };

    return (
        <Show when={planDetails()}>
            <VStack>
                <NiceP>
                    {i18n.t("settings.plus.join")}{" "}
                    <strong class="text-white">
                        {i18n.t("settings.plus.title")}
                    </strong>{" "}
                    {i18n.t("settings.plus.sats_per_month", {
                        amount: Number(
                            planDetails().amount_sat
                        ).toLocaleString()
                    })}
                </NiceP>
                <Show when={error()}>
                    <InfoBox accent="red">{error()!.message}</InfoBox>
                </Show>
                <Show when={!hasEnough()}>
                    <TinyText>
                        {i18n.t("settings.plus.lightning_balance", {
                            amount: Number(
                                planDetails().amount_sat
                            ).toLocaleString()
                        })}
                    </TinyText>
                </Show>
                <div class="flex gap-2">
                    <Button
                        intent="red"
                        layout="flex"
                        onClick={() => setConfirmOpen(true)}
                        disabled={!hasEnough()}
                    >
                        {i18n.t("settings.plus.join")}
                    </Button>
                    <Button
                        intent="green"
                        layout="flex"
                        onClick={restore}
                        loading={restoring()}
                    >
                        {i18n.t("settings.plus.restore")}
                    </Button>
                </div>
            </VStack>
            <ConfirmDialog
                loading={subbing()}
                open={confirmOpen()}
                onConfirm={handleConfirm}
                onCancel={() => setConfirmOpen(false)}
            >
                <p>
                    {i18n.t("settings.plus.ready_to_join")}{" "}
                    <strong class="text-white">
                        {i18n.t("settings.plus.title")}
                    </strong>
                    ?{i18n.t("settings.plus.click_confirm")}
                </p>
            </ConfirmDialog>
        </Show>
    );
}

export default function Plus() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink
                        href="/settings"
                        title={i18n.t("settings.header")}
                    />
                    <LargeHeader>{i18n.t("settings.plus.title")}</LargeHeader>
                    <VStack>
                        <Switch>
                            <Match when={state.mutiny_plus}>
                                <img src={party} class="w-1/2 mx-auto" />
                                <NiceP>{i18n.t("settings.plus.thanks")}</NiceP>
                                <Perks alreadySubbed />
                                <NiceP>
                                    {i18n.t("settings.plus.renewal_time")}{" "}
                                    <strong class="text-white">
                                        {new Date(
                                            state.subscription_timestamp! * 1000
                                        ).toLocaleDateString()}
                                    </strong>
                                    .
                                </NiceP>
                                <NiceP>
                                    {i18n.t("settings.plus.cancel")}{" "}
                                    <A href="/settings/connections">
                                        {i18n.t(
                                            "settings.plus.wallet_connection"
                                        )}
                                    </A>
                                </NiceP>
                            </Match>
                            <Match when={!state.mutiny_plus}>
                                <NiceP>
                                    {i18n.t("settings.plus.open_source")}{" "}
                                    <strong>
                                        {i18n.t("settings.plus.optional_pay")}
                                    </strong>
                                </NiceP>
                                <NiceP>
                                    {i18n.t("settings.plus.paying_for")}{" "}
                                    <strong class="text-white">
                                        {i18n.t("settings.plus.title")}
                                    </strong>{" "}
                                    {i18n.t("settings.plus.supports_dev")}
                                </NiceP>
                                <Perks />
                                <FancyCard
                                    title={i18n.t("settings.plus.subscribe")}
                                >
                                    <Suspense fallback={<LoadingShimmer />}>
                                        <PlusCTA />
                                    </Suspense>
                                </FancyCard>
                            </Match>
                        </Switch>
                    </VStack>
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
