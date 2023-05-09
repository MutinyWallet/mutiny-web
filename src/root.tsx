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
  Title,
} from "solid-start";
import "./root.css";
import { Provider as MegaStoreProvider } from "~/state/megaStore";
import { Toaster } from "~/components/Toaster";
import ErrorDisplay from "./components/ErrorDisplay";

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
        <Meta name="description" content="Lightning wallet for the web" />
        <Link rel="icon" href="/favicon.ico" />
        <Link rel="apple-touch-icon" href="/images/icon.png" sizes="512x512" />
        <Link rel="mask-icon" href="/mutiny_logo_mask.svg" color="#000" />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary fallback={(e) => <ErrorDisplay error={e} />}>
            <MegaStoreProvider>
              <Routes>
                <FileRoutes />
              </Routes>
              <Toaster />
            </MegaStoreProvider>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
