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

function Perks(props: { alreadySubbed?: boolean }) {
    return (
        <ul class="list-disc ml-8 font-light text-lg">
            <Show when={props.alreadySubbed}>
                <li>Smug satisfaction</li>
            </Show>
            <li>
                Redshift <em>(coming soon)</em>
            </li>
            <li>
                Gifting <em>(coming soon)</em>
            </li>
            <li>
                Multi-device access <em>(coming soon)</em>
            </li>
            <li>... and more to come</li>
        </ul>
    );
}

function PlusCTA() {
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
                throw new Error("No plans found");

            const invoice = await state.mutiny_wallet?.subscribe_to_plan(
                planDetails().id
            );

            if (!invoice?.bolt11) throw new Error("Couldn't subscribe");

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
                setError(new Error("No existing subscription found"));
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
                    Join <strong class="text-white">Mutiny+</strong> for{" "}
                    {Number(planDetails().amount_sat).toLocaleString()} sats a
                    month.
                </NiceP>
                <Show when={error()}>
                    <InfoBox accent="red">{error()!.message}</InfoBox>
                </Show>
                <Show when={!hasEnough()}>
                    <TinyText>
                        You'll need at least{" "}
                        {Number(planDetails().amount_sat).toLocaleString()} sats
                        in your lightning balance to get started. Try before you
                        buy!
                    </TinyText>
                </Show>
                <div class="flex gap-2">
                    <Button
                        intent="red"
                        layout="flex"
                        onClick={() => setConfirmOpen(true)}
                        disabled={!hasEnough()}
                    >
                        Join
                    </Button>
                    <Button
                        intent="green"
                        layout="flex"
                        onClick={restore}
                        loading={restoring()}
                    >
                        Restore Subscription
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
                    Ready to join <strong class="text-white">Mutiny+</strong>?
                    Click confirm to pay for your first month.
                </p>
            </ConfirmDialog>
        </Show>
    );
}

export default function Plus() {
    const [state, _actions] = useMegaStore();

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink href="/settings" title="Settings" />
                    <LargeHeader>Mutiny+</LargeHeader>
                    <VStack>
                        <Switch>
                            <Match when={state.mutiny_plus}>
                                <img src={party} class="w-1/2 mx-auto" />
                                <NiceP>
                                    You're part of the mutiny! Enjoy the
                                    following perks:
                                </NiceP>
                                <Perks alreadySubbed />
                                <NiceP>
                                    You'll get a renewal payment request around{" "}
                                    <strong class="text-white">
                                        {new Date(
                                            state.subscription_timestamp! * 1000
                                        ).toLocaleDateString()}
                                    </strong>
                                    .
                                </NiceP>
                                <NiceP>
                                    To cancel your subscription just don't pay.
                                    You can also disable the Mutiny+{" "}
                                    <A href="/settings/connections">
                                        Wallet Connection.
                                    </A>
                                </NiceP>
                            </Match>
                            <Match when={!state.mutiny_plus}>
                                <NiceP>
                                    Mutiny is open source and self-hostable.{" "}
                                    <strong>
                                        But also you can pay for it.
                                    </strong>
                                </NiceP>
                                <NiceP>
                                    Paying for{" "}
                                    <strong class="text-white">Mutiny+</strong>{" "}
                                    helps support ongoing development and
                                    unlocks early access to new features and
                                    premium functionality:
                                </NiceP>
                                <Perks />
                                <FancyCard title="Subscribe">
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
