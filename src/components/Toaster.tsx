import { Toast, toaster } from "@kobalte/core";
import { X } from "lucide-solid";
import { Portal } from "solid-js/web";

import { SmallHeader } from "~/components";

export function Toaster() {
    return (
        <Portal>
            <Toast.Region class="fixed left-0 right-0 top-0 z-[9999] flex w-full justify-center gap-4 safe-top safe-left safe-right safe-bottom">
                <Toast.List class="mt-8 flex w-[400px] max-w-[100vw] flex-col gap-4" />
            </Toast.Region>
        </Portal>
    );
}

export type ToastArg = { title: string; description: string } | Error;

export function showToast(arg: ToastArg) {
    if (arg instanceof Error) {
        return toaster.show((props) => (
            <ToastItem
                title="Error"
                description={arg.message}
                isError
                {...props}
            />
        ));
    } else {
        return toaster.show((props) => (
            <ToastItem
                title={arg.title}
                description={arg.description}
                {...props}
            />
        ));
    }
}

function ToastItem(props: {
    toastId: number;
    title: string;
    description: string;
    isError?: boolean;
}) {
    return (
        <Toast.Root
            toastId={props.toastId}
            class={`mx-auto w-[80vw] max-w-[400px] rounded-xl border bg-neutral-900/80 p-4 shadow-xl backdrop-blur-md ${
                props.isError ? "border-m-red/50" : "border-white/10"
            } `}
        >
            <div class="flex w-full items-start justify-between gap-4">
                <div class="flex-1">
                    <Toast.Title>
                        <SmallHeader>{props.title}</SmallHeader>
                    </Toast.Title>
                    <Toast.Description>
                        <p>{props.description}</p>
                    </Toast.Description>
                </div>
                <Toast.CloseButton class="flex-0 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 active:bg-m-blue">
                    <X />
                </Toast.CloseButton>
            </div>
        </Toast.Root>
    );
}
