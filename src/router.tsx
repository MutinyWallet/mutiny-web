// @refresh reload
import { Match, onCleanup, Switch } from "solid-js";
import { FileRoutes, Routes, useNavigate } from "solid-start";

import "./root.css";

import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

import { SetupErrorDisplay, Toaster } from "~/components";

import { useMegaStore } from "./state/megaStore";

function GlobalListeners() {
    // listeners for native navigation handling
    // Check if the platform is Android to handle back
    if (Capacitor.getPlatform() === "android") {
        const { remove } = CapacitorApp.addListener(
            "backButton",
            ({ canGoBack }) => {
                if (!canGoBack) {
                    CapacitorApp.exitApp();
                } else {
                    window.history.back();
                }
            }
        );

        // Ensure the listener is cleaned up when the component is destroyed
        onCleanup(() => {
            console.debug("cleaning up backButton listener");
            remove();
        });
    }

    // Handle app links on native platforms
    if (Capacitor.isNativePlatform()) {
        const navigate = useNavigate();
        const { remove } = CapacitorApp.addListener("appUrlOpen", (data) => {
            const url = new URL(data.url);
            const path = url.pathname;
            const urlParams = new URLSearchParams(url.search);

            console.log(`Navigating to ${path}?${urlParams.toString()}`);
            navigate(`${path}?${urlParams.toString()}`);
        });

        onCleanup(() => {
            console.debug("cleaning up appUrlOpen listener");
            remove();
        });
    }

    return null;
}

export function Router() {
    const [state, _] = useMegaStore();

    return (
        <Switch>
            <Match when={state.setup_error}>
                <SetupErrorDisplay initialError={state.setup_error!} />
            </Match>
            <Match when={true}>
                <Routes>
                    <GlobalListeners />
                    <FileRoutes />
                </Routes>
                <Toaster />
            </Match>
        </Switch>
    );
}
