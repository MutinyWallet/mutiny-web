// @refresh reload
import { Match, onCleanup, Switch } from "solid-js";
import { FileRoutes, Routes, useNavigate } from "solid-start";

import "./root.css";

import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

import { SetupErrorDisplay, Toaster } from "~/components";

import { useMegaStore } from "./state/megaStore";
import {fiatToSats} from "~/utils";
import {MutinyInvoice, MutinyWallet} from "@mutinywallet/mutiny-wasm";

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

function GetInvoiceForUsd(mutiny_wallet: MutinyWallet, price: number, amount: number)  {
    const bigAmount = BigInt(fiatToSats(price, amount, false))
    const tags: string[] = []
    return mutiny_wallet.create_bip21(bigAmount, tags)
}

export function OpenWebsocket(url: string) {
    const [state, _] = useMegaStore();
    const socket = new WebSocket(url)

    let sequence = 1;
    const pingInterval = setInterval(_ => {
        try {
            socket.send(JSON.stringify({"type": "wallet_ping", "sequence": sequence++}))
        } catch (e) {
            console.error("caught exception sending ping", e)
            clearInterval(pingInterval)
        }
    }, 800)

    // from Receive.tsx
    async function checkIfPaid(
        lightning: string
    ): Promise<MutinyInvoice | undefined> {
        console.debug("checking if paid...");

        try {
            const invoice =
                await state.mutiny_wallet?.get_invoice(lightning);

            if (invoice && invoice.paid) {
                return invoice;
            }
        } catch (e) {
            console.error(e);
        }
    }

    function pollForPayment(lightning : string) {
        const checkInterval = 1_000; // one second
        const checkPeriod = 120_000; // two minutes
        let checks = checkPeriod / checkInterval;

        const interval = setInterval(async () => {
            if (checks-- < 0) clearInterval(interval);
            const paid = await checkIfPaid(lightning);
            if (paid) {
                socket.send(JSON.stringify({ type: "paid", invoice: lightning }))
                clearInterval(interval);
            }
        }, checkInterval);
    }

    socket.onmessage = (m => {
        const event = JSON.parse(m.data)
        switch (event.type) {
            case "request": {
                if (state.mutiny_wallet && state.price) {
                    const amount = parseFloat(event.amount)
                    GetInvoiceForUsd(state.mutiny_wallet, state.price, amount)
                        .then(bip21 => {
                            if (bip21.invoice) {
                                socket.send(JSON.stringify({ type : "invoice", "invoice": bip21.invoice }))
                                pollForPayment(bip21.invoice)
                            } else {
                                socket.send(JSON.stringify({ type: "invoice", "error": "no_invoice"}))
                            }
                        })
                        .catch(reason => socket.send(JSON.stringify({ type: "invoice", "error": reason })))
                } else {
                    const error = !state.mutiny_wallet ? "no_wallet" : "no_price"
                    socket.send(JSON.stringify({ type: " error", "error": error }))
                }
            }
        }
    })
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
