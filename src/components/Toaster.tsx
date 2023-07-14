import { Toast, toaster } from "@kobalte/core";
import { Portal } from "solid-js/web";
import close from "~/assets/icons/close.svg";
import { SmallHeader } from "./layout";

export function Toaster() {
    return (
        <Portal>
            <Toast.Region class="z-[9999] top-0 fixed flex gap-4 w-full justify-center safe-top safe-left safe-right safe-bottom">
                <Toast.List class="max-w-[100vw] w-[400px] mt-8 flex flex-col gap-4" />
            </Toast.Region>
        </Portal>
    );
}

type ToastArg = { title: string; description: string } | Error;

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

export function ToastItem(props: {
    toastId: number;
    title: string;
    description: string;
    isError?: boolean;
}) {
    return (
        <Toast.Root
            toastId={props.toastId}
            class={`w-[80vw] max-w-[400px] mx-auto p-4 bg-neutral-900/80 backdrop-blur-md shadow-xl rounded-xl border ${
                props.isError ? "border-m-red/50" : "border-white/10"
            } `}
        >
            <div class="flex gap-4 w-full justify-between items-start">
                <div class="flex-1">
                    <Toast.Title>
                        <SmallHeader>{props.title}</SmallHeader>
                    </Toast.Title>
                    <Toast.Description>
                        <p>{props.description}</p>
                    </Toast.Description>
                </div>
                <Toast.CloseButton class="hover:bg-white/10 rounded-lg active:bg-m-blue flex-0 w-8 h-8">
                    <img src={close} alt="Close" />
                </Toast.CloseButton>
            </div>
        </Toast.Root>
    );
}
