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
        <Meta name="theme-color" content="#000000" />
        <Meta name="description" content="Lightning wallet for the web" />
        <Link rel="icon" href="/favicon.ico" />
        <Link rel="apple-touch-icon" href="/180.png" sizes="180x180" />
        <Link rel="mask-icon" href="/mutiny_logo_mask.svg" color="#000" />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <MegaStoreProvider>
              <Routes>
                <FileRoutes />
              </Routes>
            </MegaStoreProvider>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
