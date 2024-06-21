import "cordova-plugin-purchase";

const { store, ProductType, Platform } = CdvPurchase;

// This should only be called once per app run
export function initializeIAP() {
    store.verbosity = CdvPurchase.LogLevel.DEBUG;
    // Tell the plugin which products we care about
    store.register([
        {
            id: "mutiny_plus_subscription",
            type: ProductType.PAID_SUBSCRIPTION,
            platform: Platform.APPLE_APPSTORE
        }
    ]);

    store.initialize([Platform.APPLE_APPSTORE]);
}

export { store };
