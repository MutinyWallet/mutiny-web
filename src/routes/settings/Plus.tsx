import { Capacitor } from "@capacitor/core";
import { A, useNavigate } from "@solidjs/router";
import { AtSign } from "lucide-solid";
import {
    createResource,
    createSignal,
    For,
    Match,
    onMount,
    Show,
    Suspense,
    Switch
} from "solid-js";

import party from "~/assets/party.gif";
import {
    BackLink,
    Button,
    ButtonCard,
    ButtonLink,
    ConfirmDialog,
    DefaultMain,
    FancyCard,
    InfoBox,
    LargeHeader,
    LoadingShimmer,
    MutinyWalletGuard,
    NavBar,
    NiceP,
    TinyText,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { store as iapStore, initializeIAP } from "~/logic/iap";
import { useMegaStore } from "~/state/megaStore";
import { eify, vibrateSuccess } from "~/utils";

const DEBUG_MODE = true;

function PlusAppleIAPCTA() {
    const i18n = useI18n();

    const [error, _setError] = createSignal<Error>();

    function onApproved(t: CdvPurchase.Transaction) {
        console.log("cdv onApproved");
        t.finish();
    }

    const [subscriptionProducts, setSubscriptionProducts] =
        createSignal<CdvPurchase.Product[]>();

    const [transaction, setTransaction] =
        createSignal<CdvPurchase.Transaction>();

    const [transactions, setTransactions] =
        createSignal<CdvPurchase.Transaction[]>();

    // const [products, setProducts] = createSignal<CdvPurchase.Product>();

    // const [receipt, setReceipt] = createSignal<CdvPurchase.Receipt>();

    const [receipts, setReceipts] = createSignal<CdvPurchase.Receipt[]>();

    function onProductUpdated(product: CdvPurchase.Product) {
        console.log("cdv onProductUpdated");
        // setProduct(product);
    }

    function onReceiptUpdated(receipt: CdvPurchase.Receipt) {
        console.log("cdv onReceiptUpdated");
        // setReceipt(receipt);
    }

    // function onReceiptsReady(receipts: CdvPurchase.Receipt[]) {
    //     console.log("cdv onReceiptsReady");
    //     setReceipts(receipts);
    // }

    function onTransactionUpdated(transaction: CdvPurchase.Transaction) {
        console.log("cdv onTransactionUpdated");
        setTransaction(transaction);
    }

    // We have to do this onmount because it's all callback based
    onMount(() => {
        // Initialize IAP. We get warned about doing this multiple times (if they leave and come back) but I'm not sure it's a problem
        initializeIAP();

        // Setup callbacks for updates, like when a product is purchased, or the server approves a purchase
        iapStore
            .when()
            .productUpdated(onProductUpdated)
            .receiptUpdated(onReceiptUpdated)
            .initiated(onTransactionUpdated)
            .finished(onTransactionUpdated)
            .approved(onApproved);

        // Callback for errors
        iapStore.error((e) => {
            console.error("cdv error", e);
        });

        // When the store is ready get the products
        iapStore.ready(() => {
            setReceipts(iapStore.localReceipts);
            setTransactions(iapStore.localTransactions);
            setSubscriptionProducts(iapStore.products);
            // btw there's also a store.update() method we might need eventually
        });
    });

    function purchase() {
        // TODO be smarter about this
        const product = subscriptionProducts()![0];

        // Gets the first offer, which is the only offer
        const offer = product.getOffer();
        console.log("cdv offer", offer);
        if (!offer) throw new Error("No offer found");
        // Could we put the lnurl auth id here?
        iapStore.order(offer, {
            applicationUsername: "abc123testusername"
        });

        console.log("cdv done ordering");
    }

    function restorePurchases() {
        // TODO: I get an error here, probably because I don't actually need to restore the purchase?
        // To Native Cordova ->  InAppPurchase restoreCompletedTransactions INVALID ["options": []]
        // [CdvPurchase.AppleAppStore] INFO: restoreFailed: 6777010
        // (Error 6777010 is a failure to connect to itunes store)
        iapStore.restorePurchases();
    }

    return (
        <>
            <Show
                when={subscriptionProducts() && subscriptionProducts()?.length}
                fallback={<LoadingShimmer />}
            >
                <VStack>
                    <NiceP>
                        {i18n.t("settings.plus.join")}{" "}
                        <strong class="text-white">
                            {i18n.t("settings.plus.title")}
                        </strong>{" "}
                        {subscriptionProducts()![0].pricing?.price}
                    </NiceP>
                    <Show when={error()}>
                        <InfoBox accent="red">{error()!.message}</InfoBox>
                    </Show>
                    <div class="flex gap-2">
                        <Button intent="red" layout="flex" onClick={purchase}>
                            {i18n.t("settings.plus.join")}
                        </Button>
                    </div>
                    <button
                        class="underline decoration-m-grey-400 hover:decoration-white"
                        onClick={restorePurchases}
                    >
                        {i18n.t("settings.plus.restore")}
                    </button>
                </VStack>
            </Show>
            <Show when={DEBUG_MODE}>
                <details>
                    <summary>transaction</summary>
                    <pre>{JSON.stringify(transaction(), null, 2)}</pre>
                </details>
                <details>
                    <summary>transactions</summary>
                    <pre>{JSON.stringify(transactions(), null, 2)}</pre>
                </details>
                <details>
                    <summary>receipt</summary>
                    <pre>{JSON.stringify(receipts(), null, 2)}</pre>
                </details>
                <details>
                    <summary>product</summary>
                    <pre>{JSON.stringify(subscriptionProducts(), null, 2)}</pre>
                </details>
            </Show>
        </>
    );
}

function Perks(props: { alreadySubbed?: boolean }) {
    const i18n = useI18n();

    return (
        <ul class="ml-8 list-disc text-lg font-light">
            <Show when={props.alreadySubbed}>
                <li>{i18n.t("settings.plus.satisfaction")}</li>
            </Show>
            <li>{i18n.t("settings.plus.lightning_address")}</li>
            <li>{i18n.t("settings.plus.more")}</li>
        </ul>
    );
}

function PlusCTA() {
    const i18n = useI18n();
    const [state, actions, sw] = useMegaStore();

    const [subbing, setSubbing] = createSignal(false);
    const [confirmOpen, setConfirmOpen] = createSignal(false);

    const [error, setError] = createSignal<Error>();

    const [planDetails] = createResource(async () => {
        try {
            const plans = await sw.get_subscription_plans();
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

            const invoice = await sw.subscribe_to_plan(planDetails()!.id);

            if (!invoice?.bolt11)
                throw new Error(i18n.t("settings.plus.error_failure"));

            await sw.pay_subscription_invoice(invoice?.bolt11, true);

            await vibrateSuccess();

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

    const hasEnough = () => {
        if (!planDetails()) return false;
        return (
            (state.balance?.lightning || 0n) +
                (state.balance?.federation || 0n) >
            planDetails()!.amount_sat
        );
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
                            planDetails()!.amount_sat
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
                                planDetails()!.amount_sat
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
                    ? {i18n.t("settings.plus.click_confirm")}
                </p>
            </ConfirmDialog>
        </Show>
    );
}

export function Plus() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const navigate = useNavigate();

    const ios = Capacitor.getPlatform() === "ios";

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <BackLink href="/settings" title={i18n.t("settings.header")} />
                <LargeHeader>{i18n.t("settings.plus.title")}</LargeHeader>
                <Switch>
                    <Match when={state.mutiny_plus}>
                        <img src={party} class="mx-auto w-1/2" />
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
                                {i18n.t("settings.plus.wallet_connection")}
                            </A>
                        </NiceP>
                        <Show when={import.meta.env.VITE_HERMES}>
                            <ButtonCard
                                onClick={() =>
                                    navigate("/settings/lightningaddress")
                                }
                            >
                                <div class="flex items-center gap-2">
                                    <AtSign class="inline-block text-m-red" />
                                    <NiceP>
                                        {i18n.t(
                                            "settings.lightning_address.create"
                                        )}
                                    </NiceP>
                                </div>
                            </ButtonCard>
                        </Show>
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
                        <FancyCard title={i18n.t("settings.plus.subscribe")}>
                            <Suspense fallback={<LoadingShimmer />}>
                                <Switch>
                                    <Match when={ios}>
                                        <PlusAppleIAPCTA />
                                    </Match>
                                    <Match when={!ios}>
                                        <PlusCTA />
                                    </Match>
                                </Switch>
                            </Suspense>
                        </FancyCard>
                    </Match>
                </Switch>
            </DefaultMain>
            <NavBar activeTab="settings" />
        </MutinyWalletGuard>
    );
}
