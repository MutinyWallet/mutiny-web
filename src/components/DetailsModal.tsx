import { Dialog } from "@kobalte/core";
import { For, JSX, ParentComponent, Show, createMemo } from "solid-js";
import { Hr, TinyButton, VStack } from "~/components/layout";
import { MutinyInvoice } from "@mutinywallet/mutiny-wasm";
import { OnChainTx } from "./Activity";

import close from "~/assets/icons/close.svg";
import bolt from "~/assets/icons/bolt-black.svg";
import copyIcon from "~/assets/icons/copy.svg"

import { ActivityAmount } from "./ActivityItem";
import { CopyButton } from "./ShareCard";
import { prettyPrintTime } from "~/utils/prettyPrintTime";
import { useMegaStore } from "~/state/megaStore";
import { tagToMutinyTag } from "~/utils/tags";
import { useCopy } from "~/utils/useCopy";

const OVERLAY = "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
const DIALOG_POSITIONER = "fixed inset-0 z-50 flex items-center justify-center"
const DIALOG_CONTENT = "max-w-[500px] w-[90vw] max-h-[100dvh] overflow-y-scroll disable-scrollbars mx-4 p-4 bg-neutral-800/80 backdrop-blur-md shadow-xl rounded-xl border border-white/10"

function LightningHeader(props: { info: MutinyInvoice }) {
    const [state, _actions] = useMegaStore();

    const tags = createMemo(() => {
        if (props.info.labels.length) {
            let contact = state.mutiny_wallet?.get_contact(props.info.labels[0]);
            if (contact) {
                return [tagToMutinyTag(contact)]
            } else {
                return []
            }
        } else {
            return []
        }
    })

    return (
        <div class="flex flex-col items-center gap-4">
            <div class="p-4 bg-neutral-100 rounded-full">
                <img src={bolt} alt="lightning bolt" class="w-8 h-8" />
            </div>
            <h1 class="uppercase font-semibold">{props.info.is_send ? "Lightning send" : "Lightning receive"}</h1>
            <ActivityAmount center amount={props.info.amount_sats?.toString() ?? "0"} price={state.price} positive={!props.info.is_send} />
            <For each={tags()}>
                {(tag) => (
                    <TinyButton tag={tag} onClick={() => { }}>
                        {tag.name}
                    </TinyButton>
                )}
            </For>
        </div>
    )
}

const KeyValue: ParentComponent<{ key: string }> = (props) => {
    return (
        <li class="flex justify-between items-center gap-4">
            <span class="uppercase font-semibold whitespace-nowrap">{props.key}</span>
            {props.children}
        </li>

    )

}

function MiniStringShower(props: { text: string }) {
    const [copy, _copied] = useCopy({ copiedTimeout: 1000 });

    return (
        <div class="w-full grid gap-1 grid-cols-[minmax(0,_1fr)_auto]">
            <pre class="truncate text-neutral-300">{props.text}</pre>
            <button class="w-[1rem]" onClick={() => copy(props.text)}>
                <img src={copyIcon} alt="copy" />
            </button>
        </div>
    )
}

function LightningDetails(props: { info: MutinyInvoice }) {
    return (
        <VStack>
            <ul class="flex flex-col gap-4">
                <KeyValue key="Status">
                    <span class="text-neutral-300">{props.info.paid ? "Paid" : "Unpaid"}</span>
                </KeyValue>
                <KeyValue key="When">
                    <span class="text-neutral-300">{prettyPrintTime(Number(props.info.last_updated))}</span>
                </KeyValue>
                <Show when={props.info.description}>
                    <KeyValue key="Description">
                        <span class="text-neutral-300 truncate">{props.info.description}</span>
                    </KeyValue>
                </Show>
                <KeyValue key="Fees">
                    <span class="text-neutral-300">{props.info.fees_paid?.toLocaleString() ?? 0}</span>
                </KeyValue>
                <KeyValue key="Bolt11">
                    <MiniStringShower text={props.info.bolt11 ?? ""} />
                </KeyValue>
                <KeyValue key="Payment Hash">
                    <MiniStringShower text={props.info.payment_hash ?? ""} />
                </KeyValue>
                <KeyValue key="Preimage">
                    <MiniStringShower text={props.info.preimage ?? ""} />
                </KeyValue>
            </ul>
        </VStack>

    )
}

export function DetailsModal(props: { title: string, open: boolean, data?: MutinyInvoice | OnChainTx, setOpen: (open: boolean) => void, children?: JSX.Element }) {
    const json = createMemo(() => JSON.stringify(props.data, null, 2));

    return (
        <Dialog.Root open={props.open} onOpenChange={(isOpen) => props.setOpen(isOpen)}>
            <Dialog.Portal>
                <Dialog.Overlay class={OVERLAY} />
                <div class={DIALOG_POSITIONER}>
                    <Dialog.Content class={DIALOG_CONTENT}>
                        <div class="flex justify-between mb-2">
                            <div />
                            <Dialog.CloseButton>
                                <button tabindex="-1" class="self-center hover:bg-white/10 rounded-lg active:bg-m-blue ">
                                    <img src={close} alt="Close" class="w-8 h-8" />
                                </button>
                            </Dialog.CloseButton>
                        </div>
                        <Dialog.Title>
                            <LightningHeader info={props.data as MutinyInvoice} />
                        </Dialog.Title>
                        <Hr />
                        <Dialog.Description class="flex flex-col gap-4">
                            <LightningDetails info={props.data as MutinyInvoice} />
                            <div class="flex justify-center">
                                <CopyButton title="Copy" text={json()} />
                            </div>
                        </Dialog.Description>
                    </Dialog.Content>
                </div>
            </Dialog.Portal>
        </Dialog.Root >
    )
}
