// @refresh reload
import { Suspense } from "solid-js";
import {
    Body,
    ErrorBoundary,
    FileRoutes,
    Head,
    Html,
    Link,
    Meta,
    Routes,
    Scripts,
    Title
} from "solid-start";
import "./root.css";
import { Provider as MegaStoreProvider } from "~/state/megaStore";
import { Toaster } from "~/components/Toaster";
import ErrorDisplay from "./components/ErrorDisplay";
import { I18nProvider } from "./components/I18nProvider";

export default function Root() {
    return (
        <Html lang="en">
            <Head>
                <Title>Mutiny Wallet</Title>
                <Meta charset="utf-8" />
                <Meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0 height=device-height viewport-fit=cover user-scalable=no"
                />
                <Link rel="manifest" href="/manifest.webmanifest" />
                <Meta name="theme-color" content="rgb(23,23,23)" />
                <Meta
                    name="description"
                    content="Mutiny is a self-custodial lightning wallet that runs in the browser."
                />
                <Link rel="icon" href="/favicon.ico" />
                <Meta name="twitter:card" content="summary_large_image" />
                <Meta name="twitter:title" content="Mutiny Wallet" />
                <Meta
                    name="twitter:description"
                    content="Mutiny is a self-custodial lightning wallet that runs in the browser."
                />
                <Meta
                    name="twitter:site"
                    content="https://app.mutinywallet.com/"
                />
                <Meta
                    name="twitter:image"
                    content="https://app.mutinywallet.com/images/twitter_card_image.png"
                />
                <Meta property="og:type" content="website" />
                <Meta property="og:title" content="Mutiny Wallet" />
                <Meta
                    property="og:description"
                    content="Mutiny is a self-custodial lightning wallet that runs in the browser."
                />
                <Meta
                    property="og:url"
                    content="https://app.mutinywallet.com/"
                />
                <Meta
                    property="og:image"
                    content="https://app.mutinywallet.com/images/twitter_card_image.png"
                />
                <Link
                    rel="apple-touch-icon"
                    href="/images/icon.png"
                    sizes="512x512"
                />
                <Link
                    rel="mask-icon"
                    href="/mutiny_logo_mask.svg"
                    color="#000"
                />
            </Head>
            <Body>
                <Suspense>
                    <ErrorBoundary fallback={(e) => <ErrorDisplay error={e} />}>
                        <I18nProvider>
                            <MegaStoreProvider>
                                <Routes>
                                    <FileRoutes />
                                </Routes>
                                <Toaster />
                            </MegaStoreProvider>
                        </I18nProvider>
                    </ErrorBoundary>
                </Suspense>
                <Scripts />
            </Body>
        </Html>
    );
}
