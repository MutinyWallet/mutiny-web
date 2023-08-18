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
import { LoadingIndicator, DecryptDialog } from "~/components";
import { LoadingSpinner } from "@mutinywallet/ui";
import { useI18n } from "~/i18n/context";

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
    const i18n = useI18n();
    const [waitedTooLong, setWaitedTooLong] = createSignal(false);

    setTimeout(() => {
        setWaitedTooLong(true);
    }, 10000);

    return (
        <div class="w-full h-[100dvh] flex flex-col gap-4 justify-center items-center">
            <LoadingSpinner wide />
            <Show when={waitedTooLong()}>
                <p class="max-w-[20rem] text-neutral-400">
                    {i18n.t("error.load_time.stuck")}{" "}
                    <A class="text-white" href="/emergencykit">
                        {i18n.t("error.emergency_link")}
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
            <Switch>
                <Match when={state.mutiny_wallet && !state.wallet_loading}>
                    {props.children}
                </Match>
                <Match when={true}>
                    <SafeArea>
                        <DefaultMain>
                            <LoadingIndicator />
                        </DefaultMain>
                    </SafeArea>
                </Match>
            </Switch>
            <DecryptDialog />
        </Suspense>
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
    caption?: string;
}) {
    return (
        <KCheckbox.Root
            class="inline-flex gap-2"
            classList={{
                "items-center": !props.caption,
                "items-start": !!props.caption
            }}
            checked={props.checked}
            onChange={props.onChange}
        >
            <KCheckbox.Input class="" />
            <KCheckbox.Control class="flex-0 w-8 h-8 rounded-lg border-2 border-white bg-neutral-800 ui-checked:bg-m-red">
                <KCheckbox.Indicator>
                    <img src={check} class="w-8 h-8" alt="check" />
                </KCheckbox.Indicator>
            </KCheckbox.Control>
            <KCheckbox.Label class="flex-1 text-xl font-light flex flex-col gap-1">
                {props.label}
                <Show when={props.caption}>
                    <TinyText>{props.caption}</TinyText>
                </Show>
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
