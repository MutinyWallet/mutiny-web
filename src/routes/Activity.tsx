import { For, ParentComponent, createMemo, createSignal } from "solid-js";
import { CENTER_COLUMN, MISSING_LABEL, OnChainTx, RIGHT_COLUMN, THREE_COLUMNS } from "~/components/Activity";
import { DeleteEverything } from "~/components/DeleteEverything";
import { JsonModal } from "~/components/JsonModal";
import KitchenSink from "~/components/KitchenSink";
import NavBar from "~/components/NavBar";
import { Card, DefaultMain, Hr, LargeHeader, NodeManagerGuard, SafeArea, SmallAmount, SmallHeader, VStack } from "~/components/layout";
import { BackButton } from "~/components/layout/BackButton";
import { StyledRadioGroup } from "~/components/layout/Radio";
import mempoolTxUrl from "~/utils/mempoolTxUrl";
import send from '~/assets/icons/send.svg';
import receive from '~/assets/icons/receive.svg';
import { prettyPrintTime } from "~/utils/prettyPrintTime";

const NAMES = ["alice", "bob", "carol", "dave", "ethan", "frank", "graham", "hancock"]

function ContactRow() {
    return (
        <div class="w-full overflow-x-scroll flex gap-2 disable-scrollbars">
            <div class="flex flex-col items-center">
                <div class="bg-neutral-500 flex-none h-16 w-16 rounded-full flex items-center justify-center text-4xl uppercase ">
                    +
                </div>
                <div class="overflow-ellipsis">
                    new
                </div>
            </div>
            <For each={NAMES}>
                {(name) => (
                    <div class="flex flex-col items-center">
                        <div class="bg-pink-500 flex-none h-16 w-16 rounded-full flex items-center justify-center text-4xl uppercase ">
                            {name[0]}
                        </div>
                        <div class="overflow-ellipsis">
                            {name}
                        </div>
                    </div>
                )}
            </For>
        </div>
    )
}

const CHOICES = [
    { value: "mutiny", label: "Mutiny", caption: "Your wallet activity" },
    { value: "nostr", label: "Zaps", caption: "Your friends on nostr" },
]

const SubtleText: ParentComponent = (props) => {
    return <h3 class='text-xs text-gray-500 uppercase'>{props.children}</h3>
}

function OnChainItem(props: { item: OnChainTx }) {
    const isReceive = createMemo(() => props.item.received > 0);

    const [open, setOpen] = createSignal(false)

    return (
        <>
            <JsonModal open={open()} data={props.item} title="On-Chain Transaction" setOpen={setOpen}>
                <a href={mempoolTxUrl(props.item.txid, "signet")} target="_blank" rel="noreferrer">
                    Mempool Link
                </a>
            </JsonModal>
            <div class={THREE_COLUMNS} onClick={() => setOpen(!open())}>
                <div class="flex items-center">
                    {isReceive() ? <img src={receive} alt="receive arrow" /> : <img src={send} alt="send arrow" />}
                </div>
                <div class={CENTER_COLUMN}>
                    <h2 class={MISSING_LABEL}>Unknown</h2>
                    {isReceive() ? <SmallAmount amount={props.item.received} /> : <SmallAmount amount={props.item.sent} />}
                    {/* <h2 class="truncate">Txid: {props.item.txid}</h2> */}
                </div>
                <div class={RIGHT_COLUMN}>
                    <SmallHeader class={isReceive() ? "text-m-green" : "text-m-red"}>
                        {isReceive() ? "RECEIVE" : "SEND"}
                    </SmallHeader>
                    <SubtleText>{props.item.confirmation_time?.Confirmed ? prettyPrintTime(props.item.confirmation_time?.Confirmed?.time) : "Unconfirmed"}</SubtleText>
                </div>
            </div>
        </>
    )
}

export default function Activity() {
    const [choice, setChoice] = createSignal(CHOICES[0].value)
    return (
        <NodeManagerGuard>
            <SafeArea>
                <DefaultMain>
                    <BackButton />
                    <LargeHeader>Activity</LargeHeader>
                    <ContactRow />
                    <Hr />
                    <StyledRadioGroup choices={CHOICES} value={choice()} onValueChange={setChoice} />
                    <VStack>
                        {/* <Card><p>If you know what you're doing you're in the right place!</p></Card>
                        <KitchenSink />
                        <div class='rounded-xl p-4 flex flex-col gap-2 bg-m-red overflow-x-hidden'>
                            <SmallHeader>Danger zone</SmallHeader>
                            <DeleteEverything />
                        </div> */}
                    </VStack>
                </DefaultMain>
                <NavBar activeTab="none" />
            </SafeArea>
        </NodeManagerGuard>
    )
}