import {
    JSX,
    Match,
    ParentComponent,
    Show,
    Suspense,
    Switch,
    createResource,
    createSignal
} from "solid-js";
import Linkify from "./Linkify";
import { Button, ButtonLink } from "./Button";
import {
    Collapsible,
    Checkbox as KCheckbox,
    Dialog,
    Separator
} from "@kobalte/core";
import { useMegaStore } from "~/state/megaStore";
import check from "~/assets/icons/check.svg";
import { MutinyTagItem } from "~/utils/tags";
import { generateGradient } from "~/utils/gradientHash";
import close from "~/assets/icons/close.svg";
import { A } from "solid-start";
import down from "~/assets/icons/down.svg";
import { DecryptDialog } from "../DecryptDialog";

export { Button, ButtonLink, Linkify };

export const SmallHeader: ParentComponent<{ class?: string }> = (props) => {
    return (
        <header class={`text-sm font-semibold uppercase ${props.class}`}>
            {props.children}
        </header>
    );
};

export const Card: ParentComponent<{
    title?: string | null;
    titleElement?: JSX.Element;
}> = (props) => {
    return (
        <div class="rounded-xl p-4 flex flex-col gap-2 bg-neutral-950/50 w-full">
            {props.title && <SmallHeader>{props.title}</SmallHeader>}
            {props.titleElement && props.titleElement}
            {props.children}
        </div>
    );
};

export const InnerCard: ParentComponent<{ title?: string }> = (props) => {
    return (
        <div class="rounded-xl p-4 flex flex-col gap-2 border border-white/10 bg-[rgba(255,255,255,0.05)]">
            {props.title && <SmallHeader>{props.title}</SmallHeader>}
            {props.children}
        </div>
    );
};

export const FancyCard: ParentComponent<{
    title?: string;
    subtitle?: string;
    tag?: JSX.Element;
}> = (props) => {
    return (
        <div class="border border-black/50 rounded-xl border-b-4 p-4 flex flex-col gap-2 bg-m-grey-800 shadow-fancy-card">
            {props.children}
        </div>
    );
};

export const SettingsCard: ParentComponent<{
    title?: string;
}> = (props) => {
    return (
        <VStack smallgap>
            <div class="mt-2 pl-4">
                <SmallHeader>{props.title}</SmallHeader>
            </div>
            <div class="rounded-xl py-4 flex flex-col gap-2 bg-m-grey-800 w-full">
                {props.children}
            </div>
        </VStack>
    );
};

export const Collapser: ParentComponent<{
    title: string;
    defaultOpen?: boolean;
    activityLight?: "on" | "off";
}> = (props) => {
    return (
        <Collapsible.Root class="collapsible">
            <Collapsible.Trigger class="flex w-full justify-between py-2 hover:bg-m-grey-750 active:bg-m-grey-900 px-4">
                <div class="flex items-center gap-2">
                    <Switch>
                        <Match when={props.activityLight === "on"}>
                            <div class="w-2 h-2 rounded-full bg-m-green" />
                        </Match>
                        <Match when={props.activityLight === "off"}>
                            <div class="w-2 h-2 rounded-full bg-m-red" />
                        </Match>
                    </Switch>
                    <span>{props.title}</span>
                </div>
                <img
                    src={down}
                    alt="expand / collapse"
                    class="collapsible__trigger-icon"
                />
            </Collapsible.Trigger>
            <Collapsible.Content class="p-4 bg-m-grey-900 shadow-inner">
                {props.children}
            </Collapsible.Content>
        </Collapsible.Root>
    );
};

export const SafeArea: ParentComponent = (props) => {
    return (
        <div class="h-[100dvh] safe-left safe-right">
            {/* <div class="flex-1 disable-scrollbars overflow-y-scroll md:pl-[8rem] md:pr-[6rem]"> */}
            {props.children}
            {/* </div> */}
        </div>
    );
};

export const DefaultMain: ParentComponent = (props) => {
    return (
        <main class="w-full max-w-[600px] flex flex-col gap-4 mx-auto p-4 h-full">
            {props.children}
            {/* CSS is hard sometimes */}
            <div class="py-4" />
        </main>
    );
};

export const FullscreenLoader = () => {
    const [waitedTooLong, setWaitedTooLong] = createSignal(false);

    setTimeout(() => {
        setWaitedTooLong(true);
    }, 10000);

    return (
        <div class="w-full h-[100dvh] flex flex-col gap-4 justify-center items-center">
            <LoadingSpinner wide />
            <Show when={waitedTooLong()}>
                <p class="max-w-[20rem] text-neutral-400">
                    Stuck on this screen? Try reloading. If that doesn't work,
                    check out the{" "}
                    <A class="text-white" href="/emergencykit">
                        emergency kit.
                    </A>
                </p>
            </Show>
        </div>
    );
};

export const MutinyWalletGuard: ParentComponent = (props) => {
    const [state, _] = useMegaStore();
    return (
        <Suspense fallback={<FullscreenLoader />}>
            <Show when={state.mutiny_wallet && !state.wallet_loading}>
                {props.children}
            </Show>
            <DecryptDialog />
        </Suspense>
    );
};

export const LoadingSpinner = (props: { big?: boolean; wide?: boolean }) => {
    return (
        <div
            role="status"
            class="w-full"
            classList={{
                "flex justify-center": props.wide,
                "h-full grid": props.big
            }}
        >
            <svg
                class="w-8 h-8 mr-2 text-gray-200 animate-spin fill-m-red place-self-center"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                />
                <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                />
            </svg>
        </div>
    );
};

export const Hr = () => <Separator.Root class="my-4 border-m-grey-750" />;

export const LargeHeader: ParentComponent<{
    action?: JSX.Element;
    centered?: boolean;
}> = (props) => {
    return (
        <header
            class="w-full flex justify-between items-center mt-4 mb-2"
            classList={{
                "justify-between": !props.centered,
                "justify-center": props.centered
            }}
        >
            <h1
                class="text-3xl font-semibold"
                classList={{
                    "text-center": props.centered
                }}
            >
                {props.children}
            </h1>
            <Show when={props.action}>{props.action}</Show>
        </header>
    );
};

export const VStack: ParentComponent<{
    biggap?: boolean;
    smallgap?: boolean;
}> = (props) => {
    return (
        <div
            class="flex flex-col"
            classList={{
                "gap-2": props.smallgap,
                "gap-8": props.biggap,
                "gap-4": !props.biggap && !props.smallgap
            }}
        >
            {props.children}
        </div>
    );
};

export const HStack: ParentComponent<{ biggap?: boolean }> = (props) => {
    return (
        <div class={`flex gap-${props.biggap ? "8" : "4"}`}>
            {props.children}
        </div>
    );
};

export const SmallAmount: ParentComponent<{
    amount: number | bigint;
    sign?: string;
}> = (props) => {
    return (
        <h2 class="font-light text-lg">
            {props.sign ? `${props.sign} ` : ""}
            {props.amount.toLocaleString()} <span class="text-sm">SATS</span>
        </h2>
    );
};

export const NiceP: ParentComponent = (props) => {
    return <p class="text-xl font-light text-neutral-200">{props.children}</p>;
};

export const TinyText: ParentComponent = (props) => {
    return <p class="text-neutral-400 text-sm">{props.children}</p>;
};

export const TinyButton: ParentComponent<{
    onClick: () => void;
    tag?: MutinyTagItem;
}> = (props) => {
    // TODO: don't need to run this if it's not a contact
    const [gradient] = createResource(async () => {
        return generateGradient(props.tag?.name || "?");
    });

    const bg = () =>
        props.tag?.name && props.tag?.kind === "Contact"
            ? gradient()
            : "rgb(255 255 255 / 0.1)";

    return (
        <button
            class="py-1 px-2 rounded-lg bg-white/10"
            onClick={() => props.onClick()}
            style={{ background: bg() }}
        >
            {props.children}
        </button>
    );
};

export const Indicator: ParentComponent = (props) => {
    return (
        <div class="box-border animate-pulse px-2 py-1 -my-1 bg-white/70 rounded text-xs uppercase text-black">
            {props.children}
        </div>
    );
};

export function Checkbox(props: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <KCheckbox.Root
            class="inline-flex items-center gap-2"
            checked={props.checked}
            onChange={props.onChange}
        >
            <KCheckbox.Input class="" />
            <KCheckbox.Control class="flex-0 w-8 h-8 rounded-lg border-2 border-white bg-neutral-800 ui-checked:bg-m-red">
                <KCheckbox.Indicator>
                    <img src={check} class="w-8 h-8" alt="check" />
                </KCheckbox.Indicator>
            </KCheckbox.Control>
            <KCheckbox.Label class="flex-1 text-xl font-light">
                {props.label}
            </KCheckbox.Label>
        </KCheckbox.Root>
    );
}

export function ModalCloseButton() {
    return (
        <button class="self-center justify-self-center hover:bg-white/10 rounded-lg active:bg-m-blue">
            <img src={close} alt="Close" class="w-8 h-8" />
        </button>
    );
}

export const SIMPLE_OVERLAY = "fixed inset-0 z-50 bg-black/20 backdrop-blur-md";
export const SIMPLE_DIALOG_POSITIONER =
    "fixed inset-0 z-50 flex items-center justify-center";
export const SIMPLE_DIALOG_CONTENT =
    "max-w-[500px] w-[90vw] max-h-[100dvh] overflow-y-scroll disable-scrollbars mx-4 p-4 bg-neutral-800/80 backdrop-blur-md shadow-xl rounded-xl border border-white/10";

export const SimpleDialog: ParentComponent<{
    title: string;
    open: boolean;
    setOpen?: (open: boolean) => void;
}> = (props) => {
    return (
        <Dialog.Root
            open={props.open}
            onOpenChange={props.setOpen && props.setOpen}
        >
            <Dialog.Portal>
                <Dialog.Overlay class={SIMPLE_OVERLAY} />
                <div class={SIMPLE_DIALOG_POSITIONER}>
                    <Dialog.Content class={SIMPLE_DIALOG_CONTENT}>
                        <div class="flex justify-between mb-2 items-center">
                            <Dialog.Title>
                                <SmallHeader>{props.title}</SmallHeader>
                            </Dialog.Title>
                            <Show when={props.setOpen}>
                                <Dialog.CloseButton>
                                    <ModalCloseButton />
                                </Dialog.CloseButton>
                            </Show>
                        </div>
                        <Dialog.Description class="flex flex-col gap-4">
                            {props.children}
                        </Dialog.Description>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
