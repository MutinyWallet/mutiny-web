// @refresh reload
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Title } from "@solidjs/meta";
import { ErrorBoundary, Suspense } from "solid-js";

import { ErrorDisplay, I18nProvider } from "~/components";
import { Router } from "~/router";
import { Provider as MegaStoreProvider } from "~/state/megaStore";

const setStatusBarStyleDark = async () => {
    await StatusBar.setStyle({ style: Style.Dark });
};

if (Capacitor.isNativePlatform()) {
    await setStatusBarStyleDark();
}

export default function App() {
    return (
        <Suspense>
            <Title>Mutiny Wallet</Title>
            <ErrorBoundary fallback={(e) => <ErrorDisplay error={e} />}>
                <MegaStoreProvider>
                    <I18nProvider>
                        <ErrorBoundary
                            fallback={(e) => <ErrorDisplay error={e} />}
                        >
                            <Router />
                        </ErrorBoundary>
                    </I18nProvider>
                </MegaStoreProvider>
            </ErrorBoundary>
        </Suspense>
    );
}
