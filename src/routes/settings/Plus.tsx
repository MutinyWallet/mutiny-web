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
import { useMegaStore } from "~/state/megaStore";
import { eify, vibrateSuccess } from "~/utils";

import "cordova-plugin-purchase";

import { Capacitor } from "@capacitor/core";

function PlusAppleIAPCTA() {
    const i18n = useI18n();

    const [error, _setError] = createSignal<Error>();

    function onApproved(t: CdvPurchase.Transaction) {
        console.log("cdv onApproved");
        t.finish();
    }

    const [subscriptionProducts, setSubscriptionProducts] =
        createSignal<CdvPurchase.Product[]>();

    const [transaction, setTransction] =
        createSignal<CdvPurchase.Transaction>();

    const [product, setProduct] = createSignal<CdvPurchase.Product>();

    const [receipt, setReceipt] = createSignal<CdvPurchase.Receipt>();

    // function refreshUI(arg: unknown) {
    //     console.log("cdv refreshUI with arg", arg);

    //     const { store, ProductType, Platform } = CdvPurchase;
    //     console.log("cdv onProductUpdated");
    //     const p = store.get(
    //         "mutiny_plus_subscription",
    //         Platform.APPLE_APPSTORE
    //     );
    //     console.log("cdv got product", p);
    //     if (p) {
    //         const t = store.findInLocalReceipts(p);
    //         setTransction(t);
    //     }
    // }

    function onProductUpdated(product: CdvPurchase.Product) {
        console.log("cdv onProductUpdated");
        // const t = store.findInLocalReceipts(product);
        // setTransction(t);
        setProduct(product);
    }

    function onReceiptUpdated(receipt: CdvPurchase.Receipt) {
        console.log("cdv onReceiptUpdated");
        setReceipt(receipt);
    }

    function onTransactionUpdated(transaction: CdvPurchase.Transaction) {
        console.log("cdv onTransactionUpdated");
        setTransction(transaction);
    }

    // We have to do this onmount because it's all callback based
    onMount(() => {
        const { store, ProductType, Platform } = CdvPurchase;
        // refreshUI("onmount");

        store.verbosity = CdvPurchase.LogLevel.DEBUG;
        // Tell the plugin which products we care about
        store.register([
            {
                id: "mutiny_plus_subscription",
                type: ProductType.PAID_SUBSCRIPTION,
                platform: Platform.APPLE_APPSTORE
            }
        ]);

        // Setup callbacks for updates, like when a product is purchased, or the server approves a purchase
        store
            .when()
            .productUpdated(onProductUpdated)
            .receiptUpdated(onReceiptUpdated)
            .initiated(onTransactionUpdated)
            .finished(onTransactionUpdated)
            .approved(onApproved);

        // Not sure when this is supposed to happen but it's working when it's here
        // TODO: this should only happen once per app run, maybe do it in the megastore?
        store.initialize([Platform.APPLE_APPSTORE]);

        // Callback for errors
        store.error((e) => {
            console.error("cdv error", e);
        });

        // When the store is ready get the products
        store.ready(() => {
            setSubscriptionProducts(store.products);
            // btw there's also a store.update() method we might need eventually
        });
    });

    function buyProduct(product: CdvPurchase.Product) {
        const { store } = CdvPurchase;
        // Gets the first offer, which is the only offer
        const offer = product.getOffer();
        console.log("cdv offer", offer);
        if (!offer) throw new Error("No offer found");
        // Could we put the lnurl auth id here?
        // store
        //     .when()
        //     .productUpdated(refreshUI)
        //     .receiptUpdated(refreshUI)
        //     .approved(onApproved);
        store.order(offer, {
            applicationUsername: "abc123testusername"
        });

        console.log("cdv done ordering! did we win?");
        // .then(
        //     (p) => {
        //         // Purchase in progress!
        //         console.log("cdv purchase in progress", p);
        //     },
        //     (e) => {
        //         console.log("cdv purchase error", e);
        //     }
        // );
    }

    function purchase() {
        buyProduct(subscriptionProducts()![0]);
        console.log("purchased");
    }

    return (
        <>
            <h2>product</h2>
            <pre>{JSON.stringify(product(), null, 2)}</pre>
            <h2>receipt</h2>
            <pre>{JSON.stringify(receipt(), null, 2)}</pre>
            <h2>transaction</h2>
            <pre>{JSON.stringify(transaction(), null, 2)}</pre>
            <For each={subscriptionProducts()}>
                {(subscriptionProduct) => (
                    <>
                        <pre>
                            {JSON.stringify(subscriptionProduct, null, 2)}
                        </pre>
                        <button onClick={() => buyProduct(subscriptionProduct)}>
                            Buy
                        </button>
                    </>
                )}
            </For>
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
                </VStack>
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
