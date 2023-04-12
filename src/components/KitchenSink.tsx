import { useMegaStore } from "~/state/megaStore";
import { Card, Hr, SmallHeader, Button, InnerCard } from "~/components/layout";
import PeerConnectModal from "~/components/PeerConnectModal";
import { For, Show, Suspense, createResource, createSignal } from "solid-js";
import { MutinyChannel, MutinyPeer } from "@mutinywallet/node-manager";
import { TextField } from "@kobalte/core";
import mempoolTxUrl from "~/utils/mempoolTxUrl";
import eify from "~/utils/eify";

// TODO: hopefully I don't have to maintain this type forever but I don't know how to pass it around otherwise
type RefetchPeersType = (info?: unknown) => MutinyPeer[] | Promise<MutinyPeer[] | undefined> | null | undefined

function PeersList() {
    const [state, _] = useMegaStore()

    const getPeers = async () => {
        return await state.node_manager?.list_peers() as Promise<MutinyPeer[]>
    };

    const [peers, { refetch }] = createResource(getPeers);

    return (
        <>
            <SmallHeader>
                Peers
            </SmallHeader>
            {/* By wrapping this in a suspense I don't cause the page to jump to the top */}
            <Suspense>
                <For each={peers()} fallback={<code>No peers</code>}>
                    {(peer) => (
                        <pre class="overflow-x-auto whitespace-pre-line break-all">
                            {JSON.stringify(peer, null, 2)}
                        </pre>
                    )}
                </For>
            </Suspense>
            <Button layout="small" onClick={refetch}>Refresh Peers</Button>
            <ConnectPeer refetchPeers={refetch} />
        </>
    )
}

function ConnectPeer(props: { refetchPeers: RefetchPeersType }) {
    const [state, _] = useMegaStore()

    const [value, setValue] = createSignal("");

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        const peerConnectString = value().trim();
        const nodes = await state.node_manager?.list_nodes();
        const firstNode = nodes[0] as string || ""

        await state.node_manager?.connect_to_peer(firstNode, peerConnectString)

        await props.refetchPeers()

        setValue("");
    };

    return (
        <InnerCard>
            <form class="flex flex-col gap-4" onSubmit={onSubmit} >
                <TextField.Root
                    value={value()}
                    onValueChange={setValue}
                    validationState={(value() == "" || value().startsWith("mutiny:")) ? "valid" : "invalid"}
                    class="flex flex-col gap-4"
                >
                    <TextField.Label class="text-sm font-semibold uppercase" >Connect Peer</TextField.Label>
                    <TextField.Input class="w-full p-2 rounded-lg text-black" placeholder="mutiny:028241..." />
                    <TextField.ErrorMessage class="text-red-500">Expecting something like mutiny:abc123...</TextField.ErrorMessage>
                </TextField.Root>
                <Button layout="small" type="submit">Connect</Button>
            </form >
        </InnerCard>
    )
}


type RefetchChannelsListType = (info?: unknown) => MutinyChannel[] | Promise<MutinyChannel[] | undefined> | null | undefined

function ChannelsList() {
    const [state, _] = useMegaStore()

    const getChannels = async () => {
        return await state.node_manager?.list_channels() as Promise<MutinyChannel[]>
    };

    const [channels, { refetch }] = createResource(getChannels);

    const network = state.node_manager?.get_network();

    return (
        <>
            <SmallHeader>
                Channels
            </SmallHeader>
            {/* By wrapping this in a suspense I don't cause the page to jump to the top */}
            <Suspense>
                <For each={channels()} fallback={<code>No channels</code>}>
                    {(channel) => (
                        <>
                            <pre class="overflow-x-auto whitespace-pre-line break-all">
                                {JSON.stringify(channel, null, 2)}
                            </pre>
                            <a class="text-sm font-light opacity-50 mt-2" href={mempoolTxUrl(channel.outpoint?.split(":")[0], network)} target="_blank" rel="noreferrer">
                                Mempool Link
                            </a>
                        </>
                    )}

                </For>
            </Suspense>
            <Button type="button" layout="small" onClick={(e) => { e.preventDefault(); refetch() }}>Refresh Channels</Button>
            <OpenChannel refetchChannels={refetch} />
        </>
    )
}

function OpenChannel(props: { refetchChannels: RefetchChannelsListType }) {
    const [state, _] = useMegaStore()

    const [creationError, setCreationError] = createSignal<Error>();

    const [amount, setAmount] = createSignal("");
    const [peerPubkey, setPeerPubkey] = createSignal("");

    const [newChannel, setNewChannel] = createSignal<MutinyChannel>();

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        // TODO: figure out why this doesn't catch the rust error
        // src/logging.rs:29
        // ERROR: Could not create a signed transaction to open channel with: The invoice or address is on a different network.
        try {
            const pubkey = peerPubkey().trim();
            const bigAmount = BigInt(amount());

            const nodes = await state.node_manager?.list_nodes();
            const firstNode = nodes[0] as string || ""

            const new_channel = await state.node_manager?.open_channel(firstNode, pubkey, bigAmount)

            setNewChannel(new_channel)

            await props.refetchChannels()

            setAmount("");
            setPeerPubkey("");

        } catch (e) {
            setCreationError(eify(e))
        }
    };

    return (
        <>
            <InnerCard>
                <form class="flex flex-col gap-4" onSubmit={onSubmit} >
                    <TextField.Root
                        value={peerPubkey()}
                        onValueChange={setPeerPubkey}
                        class="flex flex-col gap-2"
                    >
                        <TextField.Label class="text-sm font-semibold uppercase" >Pubkey</TextField.Label>
                        <TextField.Input class="w-full p-2 rounded-lg text-black" />
                    </TextField.Root>
                    <TextField.Root
                        value={amount()}
                        onValueChange={setAmount}
                        class="flex flex-col gap-2"
                    >
                        <TextField.Label class="text-sm font-semibold uppercase" >Amount</TextField.Label>
                        <TextField.Input
                            type="number"
                            class="w-full p-2 rounded-lg text-black" />
                    </TextField.Root>
                    <Button layout="small" type="submit">Open Channel</Button>
                </form >
            </InnerCard>
            <Show when={newChannel()}>
                <pre class="overflow-x-auto whitespace-pre-line break-all">
                    {JSON.stringify(newChannel()?.outpoint, null, 2)}
                </pre>
                <pre>{newChannel()?.outpoint}</pre>
                <a class="text-sm font-light opacity-50 mt-2" href={mempoolTxUrl(newChannel()?.outpoint?.split(":")[0], "signet")} target="_blank" rel="noreferrer">
                    Mempool Link
                </a>
            </Show>
            <Show when={creationError()}>
                <pre>{creationError()?.message}</pre>
            </Show>
        </>
    )
}

export default function KitchenSink() {
    return (
        <Card title="Kitchen Sink">
            <PeerConnectModal />
            <Hr />
            <PeersList />
            <Hr />
            <ChannelsList />
        </Card>
    )
}