import { useNavigate } from "@solidjs/router";
import { ArrowDownLeft, ArrowUpRight, Plus, Scan } from "lucide-solid";
import { createSignal, JSX, onCleanup, onMount, Show } from "solid-js";

import { Circle } from "~/components";
import { useI18n } from "~/i18n/context";

function FabMenuItem(props: {
    onClick: () => void;
    disabled?: boolean;
    children: JSX.Element;
}) {
    return (
        <button
            class="flex gap-2 px-2 py-4 disabled:opacity-50"
            disabled={props.disabled}
            onClick={() => props.onClick()}
        >
            {props.children}
        </button>
    );
}

export function FabMenu(props: {
    setOpen: (open: boolean) => void;
    children: JSX.Element;
    right?: boolean;
    left?: boolean;
}) {
    let navRef: HTMLElement;

    const handleClickOutside = (e: MouseEvent) => {
        if (e.target instanceof Element && !navRef.contains(e.target)) {
            e.stopPropagation();
            props.setOpen(false);
        }
    };

    onMount(() => {
        document.body.addEventListener("click", handleClickOutside);
    });

    onCleanup(() => {
        document.body.removeEventListener("click", handleClickOutside);
    });

    return (
        <nav
            ref={(el) => (navRef = el)}
            class="fixed z-50 rounded-xl bg-m-grey-800/90 px-2 backdrop-blur-lg"
            classList={{
                "right-8 bottom-[calc(2rem+5rem)]": props.right,
                "left-2 bottom-[calc(2rem+2rem)]": props.left
            }}
        >
            {props.children}
        </nav>
    );
}

export function Fab(props: { onSearch: () => void; onScan: () => void }) {
    const [open, setOpen] = createSignal(false);
    const navigate = useNavigate();
    const i18n = useI18n();

    return (
        <>
            <Show when={open()}>
                <FabMenu setOpen={setOpen} right>
                    <ul class="flex flex-col divide-y divide-m-grey-400/25">
                        <li>
                            <FabMenuItem
                                onClick={() => {
                                    props.onSearch();
                                    setOpen(false);
                                }}
                            >
                                <ArrowUpRight />
                                {i18n.t("common.send")}
                            </FabMenuItem>
                        </li>
                        <li>
                            <FabMenuItem onClick={() => navigate("/receive")}>
                                <ArrowDownLeft />
                                {i18n.t("common.receive")}
                            </FabMenuItem>
                        </li>

                        <li>
                            <FabMenuItem
                                onClick={() => {
                                    setOpen(false);
                                    props.onScan();
                                }}
                            >
                                <Scan />
                                {i18n.t("common.scan")}
                            </FabMenuItem>
                        </li>
                    </ul>
                </FabMenu>
            </Show>
            <div class="fixed bottom-8 right-8">
                <button id="fab" onClick={() => setOpen(!open())}>
                    <Circle size="large" color="red">
                        <Plus class="h-8 w-8" />
                    </Circle>
                </button>
            </div>
        </>
    );
}

export function MiniFab(props: {
    onSend: () => void;
    onRequest: () => void;
    onScan: () => void;
    sendDisabled?: boolean | undefined;
}) {
    const [open, setOpen] = createSignal(false);
    const i18n = useI18n();

    return (
        <>
            <Show when={open()}>
                <FabMenu setOpen={setOpen} left>
                    <ul class="flex flex-col divide-y divide-m-grey-400/25">
                        <li>
                            <FabMenuItem
                                disabled={props.sendDisabled || false}
                                onClick={() => {
                                    props.onSend();
                                    setOpen(false);
                                }}
                            >
                                <ArrowUpRight />
                                {i18n.t("common.send")}
                            </FabMenuItem>
                        </li>
                        <li>
                            <FabMenuItem
                                onClick={() => {
                                    props.onRequest();
                                    setOpen(false);
                                }}
                            >
                                <ArrowDownLeft />
                                {i18n.t("common.request")}
                            </FabMenuItem>
                        </li>

                        <li>
                            <FabMenuItem
                                onClick={() => {
                                    props.onScan();
                                    setOpen(false);
                                }}
                            >
                                <Scan />
                                {i18n.t("common.scan")}
                            </FabMenuItem>
                        </li>
                    </ul>
                </FabMenu>
            </Show>
            <button id="fab" onClick={() => setOpen(true)}>
                <Plus class="h-8 w-8 text-m-red" />
            </button>
        </>
    );
}
