import {
    Collapsible,
    Dialog,
    Checkbox as KCheckbox,
    Separator
} from "@kobalte/core";
import { TagItem, TagKind } from "@mutinywallet/mutiny-wasm";
import { A } from "@solidjs/router";
import {
    createResource,
    createSignal,
    JSX,
    Match,
    ParentComponent,
    Show,
    Suspense,
    Switch
} from "solid-js";

import check from "~/assets/icons/check.svg";
import close from "~/assets/icons/close.svg";
import down from "~/assets/icons/down.svg";
import {
    Button,
    DecryptDialog,
    LoadingIndicator,
    LoadingSpinner
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { generateGradient } from "~/utils";

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
        <div class="flex w-full flex-col gap-2 rounded-xl bg-neutral-950/50 p-4">
            {props.title && <SmallHeader>{props.title}</SmallHeader>}
            {props.titleElement && props.titleElement}
            {props.children}
        </div>
    );
};

export const InnerCard: ParentComponent<{ title?: string }> = (props) => {
    return (
        <div class="flex flex-col gap-2 rounded-xl border border-white/10 bg-[rgba(255,255,255,0.05)] p-4">
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
        <div class="flex flex-col gap-2 rounded-xl border border-b-4 border-black/50 bg-m-grey-800 p-4 shadow-fancy-card">
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
            <div class="flex w-full flex-col gap-2 rounded-xl bg-m-grey-800 py-4">
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
        <Collapsible.Root defaultOpen={props.defaultOpen} class="collapsible">
            <Collapsible.Trigger class="flex w-full justify-between px-4 py-2 hover:bg-m-grey-750 active:bg-m-grey-900">
                <div class="flex items-center gap-2">
                    <Switch>
                        <Match when={props.activityLight === "on"}>
                            <div class="h-2 w-2 rounded-full bg-m-green" />
                        </Match>
                        <Match when={props.activityLight === "off"}>
                            <div class="h-2 w-2 rounded-full bg-m-red" />
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
            <Collapsible.Content class="bg-m-grey-950 p-4 shadow-inner">
                {props.children}
            </Collapsible.Content>
        </Collapsible.Root>
    );
};

export const SafeArea: ParentComponent = (props) => {
    return (
        <div class="safe-left safe-right h-device">
            {/* <div class="flex-1 disable-scrollbars overflow-y-scroll md:pl-[8rem] md:pr-[6rem]"> */}
            {props.children}
            {/* </div> */}
        </div>
    );
};

export const DefaultMain = (props: {
    children?: JSX.Element;
    zeroBottomPadding?: boolean;
}) => {
    return (
        <main
            class="mx-auto flex w-full max-w-[600px] flex-1 flex-col gap-4 p-4"
            classList={{ "pb-0": props.zeroBottomPadding }}
        >
            {props.children}
            {/* CSS is hard sometimes */}
            {/* <div class="py-1" /> */}
        </main>
    );
};

const FullscreenLoader = () => {
    const i18n = useI18n();
    const [waitedTooLong, setWaitedTooLong] = createSignal(false);

    setTimeout(() => {
        setWaitedTooLong(true);
    }, 10000);

    return (
        <div class="flex w-full flex-col items-center justify-center gap-4 h-device">
            <LoadingSpinner wide />
            <Show when={waitedTooLong()}>
                <p class="max-w-[20rem] text-neutral-400">
                    {i18n.t("error.load_time.stuck")}{" "}
                    <A class="text-white" href="/settings/emergencykit">
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

export const KeyValue: ParentComponent<{ key: string }> = (props) => {
    return (
        <li class="flex items-center justify-between gap-6">
            <span class="min-w-max text-sm font-semibold uppercase text-m-grey-400">
                {props.key}
            </span>
            <span class="truncate font-light">{props.children}</span>
        </li>
    );
};

export const LargeHeader: ParentComponent<{
    action?: JSX.Element;
    centered?: boolean;
}> = (props) => {
    return (
        <header
            class="mb-2 mt-4 flex w-full items-center justify-between"
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

export const NiceP: ParentComponent = (props) => {
    return <p class="text-xl font-light text-neutral-200">{props.children}</p>;
};

export const TinyText: ParentComponent = (props) => {
    return <p class="text-sm text-neutral-400">{props.children}</p>;
};

export const TinyButton: ParentComponent<{
    onClick: () => void;
    tag?: TagItem;
}> = (props) => {
    // TODO: don't need to run this if it's not a contact
    const [gradient] = createResource(async () => {
        return generateGradient(props.tag?.name || "?");
    });

    const bg = () =>
        props.tag?.name && props.tag?.kind === TagKind.Contact
            ? gradient()
            : "rgb(255 255 255 / 0.1)";

    return (
        <button
            class="rounded-lg bg-white/10 px-2 py-1"
            onClick={() => props.onClick()}
            style={{ background: bg() }}
        >
            {props.children}
        </button>
    );
};

export const Indicator: ParentComponent = (props) => {
    return (
        <div class="-my-1 box-border animate-pulse rounded bg-white/70 px-2 py-1 text-xs uppercase text-black">
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
            <KCheckbox.Control class="flex-0 h-8 w-8 rounded-lg border-2 border-white bg-neutral-800 ui-checked:bg-m-red">
                <KCheckbox.Indicator>
                    <img src={check} class="h-8 w-8" alt="check" />
                </KCheckbox.Indicator>
            </KCheckbox.Control>
            <KCheckbox.Label class="flex flex-1 flex-col gap-1 font-semibold">
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
        <button class="self-center justify-self-center rounded-lg hover:bg-white/10 active:bg-m-blue">
            <img src={close} alt="Close" class="h-8 w-8" />
        </button>
    );
}

const SIMPLE_OVERLAY = "fixed inset-0 z-50 bg-black/50 backdrop-blur-lg";
const SIMPLE_DIALOG_POSITIONER =
    "fixed inset-0 z-50 flex items-center justify-center";
const SIMPLE_DIALOG_CONTENT =
    "max-w-[500px] w-[90vw] max-h-device overflow-y-scroll disable-scrollbars mx-4 p-4 bg-neutral-800/90 rounded-xl border border-white/10";

export const SimpleDialog: ParentComponent<{
    title: string;
    open: boolean;
    setOpen?: (open: boolean) => void;
}> = (props) => {
    return (
        <Dialog.Root
            open={props.open}
            onOpenChange={props.setOpen && props.setOpen}
            modal={true}
        >
            <Dialog.Portal>
                <Dialog.Overlay class={SIMPLE_OVERLAY} />
                <div class={SIMPLE_DIALOG_POSITIONER}>
                    <Dialog.Content class={SIMPLE_DIALOG_CONTENT} tabIndex={0}>
                        <div class="mb-2 flex items-center justify-between">
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

export const ConfirmDialog: ParentComponent<{
    open: boolean;
    loading: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}> = (props) => {
    const i18n = useI18n();
    return (
        <Dialog.Root open={props.open} onOpenChange={props.onCancel}>
            <Dialog.Portal>
                <Dialog.Overlay class={SIMPLE_OVERLAY} />
                <div class={SIMPLE_DIALOG_POSITIONER}>
                    <Dialog.Content class={SIMPLE_DIALOG_CONTENT}>
                        <div class="mb-2 flex justify-between">
                            <Dialog.Title>
                                <SmallHeader>
                                    {i18n.t(
                                        "modals.confirm_dialog.are_you_sure"
                                    )}
                                </SmallHeader>
                            </Dialog.Title>
                        </div>
                        <Dialog.Description class="flex flex-col gap-4">
                            {props.children}
                            <div class="flex w-full justify-end gap-4">
                                <Button layout="small" onClick={props.onCancel}>
                                    {i18n.t("modals.confirm_dialog.cancel")}
                                </Button>
                                <Button
                                    layout="small"
                                    intent="red"
                                    onClick={props.onConfirm}
                                    loading={props.loading}
                                    disabled={props.loading}
                                >
                                    {i18n.t("modals.confirm_dialog.confirm")}
                                </Button>
                            </div>
                        </Dialog.Description>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
