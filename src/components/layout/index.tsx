import { ParentComponent, Show, Suspense } from "solid-js"
import Linkify from "./Linkify"
import { Button, ButtonLink } from "./Button"
import { Separator } from "@kobalte/core"
import { useMegaStore } from "~/state/megaStore"

const SmallHeader: ParentComponent = (props) => <header class='text-sm font-semibold uppercase'>{props.children}</header>

const Card: ParentComponent<{ title?: string }> = (props) => {
    return (
        <div class='rounded-xl p-4 flex flex-col gap-2 bg-[rgba(0,0,0,0.5)]'>
            {props.title && <SmallHeader>{props.title}</SmallHeader>}
            {props.children}
        </div>
    )
}

const InnerCard: ParentComponent<{ title?: string }> = (props) => {
    return (
        <div class='rounded-xl p-4 flex flex-col gap-2 border border-white/10 bg-[rgba(255,255,255,0.05)]'>
            {props.title && <SmallHeader>{props.title}</SmallHeader>}
            {props.children}
        </div>
    )
}

const FancyCard: ParentComponent<{ title?: string }> = (props) => {
    return (
        <div class='border border-white rounded-xl border-b-4 p-4 flex flex-col gap-2'>
            {props.title && <SmallHeader>{props.title}</SmallHeader>}
            {props.children}
        </div>
    )
}

const SafeArea: ParentComponent<{ main?: boolean }> = (props) => {
    return (
        <div class="safe-top safe-left safe-right safe-bottom">
            <div class="disable-scrollbars max-h-screen h-full overflow-y-scroll md:pl-[8rem] md:pr-[6rem]">
                <Show when={props.main} fallback={props.children}>
                    <main class='flex flex-col py-8 px-4 items-center'>
                        {props.children}
                    </main>
                </Show>
            </div>
        </div >
    )
}

function FullscreenLoader() {
    return (
        <div class="w-screen h-screen flex justify-center items-center">
            <LoadingSpinner />
        </div>
    );
}

const NodeManagerGuard: ParentComponent = (props) => {
    const [state, _] = useMegaStore();
    return (
        <Suspense fallback={<FullscreenLoader />}>
            <Show when={state.node_manager}>
                {props.children}
            </Show>
        </Suspense>
    )
}

const LoadingSpinner = () => {
    return (<div role="status" class="w-full h-full grid" >
        <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-m-red place-self-center" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
        </svg>
        <span class="sr-only">Loading...</span>
    </div>);
}

const Hr = () => <Separator.Root class="my-4 border-white/20" />

export { SmallHeader, Card, SafeArea, LoadingSpinner, Button, ButtonLink, Linkify, Hr, NodeManagerGuard, FullscreenLoader, InnerCard, FancyCard }
