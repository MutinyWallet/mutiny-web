import { useMegaStore } from "~/state/megaStore";
import { Hr, Button, InnerCard, VStack } from "~/components/layout";
import NostrWalletConnectModal from "~/components/NostrWalletConnectModal";
import { For, Show, Suspense, createResource, createSignal } from "solid-js";
import { MutinyChannel, MutinyPeer } from "@mutinywallet/mutiny-wasm";
import { Collapsible, TextField } from "@kobalte/core";
import mempoolTxUrl from "~/utils/mempoolTxUrl";
import eify from "~/utils/eify";
import { ConfirmDialog } from "~/components/Dialog";
import { showToast } from "~/components/Toaster";
import { ImportExport } from "~/components/ImportExport";
import { Network } from "~/logic/mutinyWalletSetup";
import { ExternalLink } from "./layout/ExternalLink";
import { Logs } from "./Logs";
import { Restart } from "./Restart";
import { ResyncOnchain } from "./ResyncOnchain";
import { MiniStringShower } from "./DetailsModal";

// TODO: hopefully I don't have to maintain this type forever but I don't know how to pass it around otherwise
type RefetchPeersType = (
    info?: unknown
) => MutinyPeer[] | Promise<MutinyPeer[] | undefined> | null | undefined;

function PeerItem(props: { peer: MutinyPeer }) {
    const [state, _] = useMegaStore();

    const handleDisconnectPeer = async () => {
        const nodes = await state.mutiny_wallet?.list_nodes();
        const firstNode = (nodes[0] as string) || "";

        if (props.peer.is_connected) {
            await state.mutiny_wallet?.disconnect_peer(
                firstNode,
                props.peer.pubkey
            );
        } else {
            await state.mutiny_wallet?.delete_peer(
                firstNode,
                props.peer.pubkey
            );
        }
    };

    return (
        <Collapsible.Root>
            <Collapsible.Trigger class="w-full">
                <h2 class="truncate text-start text-lg font-mono bg-neutral-200 text-black rounded px-4 py-2">
                    {">"}{" "}
                    {props.peer.alias ? props.peer.alias : props.peer.pubkey}
                </h2>
            </Collapsible.Trigger>
            <Collapsible.Content>
                <VStack>
                    <pre class="overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(props.peer, null, 2)}
                    </pre>
                    <Button
                        intent="glowy"
                        layout="xs"
                        onClick={handleDisconnectPeer}
                    >
                        Disconnect
                    </Button>
                </VStack>
            </Collapsible.Content>
        </Collapsible.Root>
    );
}

function PeersList() {
    const [state, _] = useMegaStore();

    const getPeers = async () => {
        return (await state.mutiny_wallet?.list_peers()) as Promise<
            MutinyPeer[]
        >;
    };

    const [peers, { refetch }] = createResource(getPeers);

    return (
        <>
            <InnerCard title="Peers">
                {/* By wrapping this in a suspense I don't cause the page to jump to the top */}
                <Suspense>
                    <VStack>
                        <For
                            each={peers.latest}
                            fallback={<code>No peers</code>}
                        >
                            {(peer) => <PeerItem peer={peer} />}
                        </For>
                    </VStack>
                </Suspense>
                <Button layout="small" onClick={refetch}>
                    Refresh Peers
                </Button>
            </InnerCard>
            <ConnectPeer refetchPeers={refetch} />
        </>
    );
}

function ConnectPeer(props: { refetchPeers: RefetchPeersType }) {
    const [state, _] = useMegaStore();

    const [value, setValue] = createSignal("");

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        const peerConnectString = value().trim();
        const nodes = await state.mutiny_wallet?.list_nodes();
        const firstNode = (nodes[0] as string) || "";

        await state.mutiny_wallet?.connect_to_peer(
            firstNode,
            peerConnectString
        );

        await props.refetchPeers();

        setValue("");
    };

    return (
        <InnerCard>
            <form class="flex flex-col gap-4" onSubmit={onSubmit}>
                <TextField.Root
                    value={value()}
                    onChange={setValue}
                    validationState={value() == "" ? "valid" : "invalid"}
                    class="flex flex-col gap-4"
                >
                    <TextField.Label class="text-sm font-semibold uppercase">
                        Connect Peer
                    </TextField.Label>
                    <TextField.Input
                        class="w-full p-2 rounded-lg text-black"
                        placeholder="028241..."
                    />
                    <TextField.ErrorMessage class="text-red-500">
                        Expecting a value...
                    </TextField.ErrorMessage>
                </TextField.Root>
                <Button layout="small" type="submit">
                    Connect
                </Button>
            </form>
        </InnerCard>
    );
}

type RefetchChannelsListType = (
    info?: unknown
) => MutinyChannel[] | Promise<MutinyChannel[] | undefined> | null | undefined;

function ChannelItem(props: { channel: MutinyChannel; network?: Network }) {
    const [state, _] = useMegaStore();

    const [confirmOpen, setConfirmOpen] = createSignal(false);
    const [confirmLoading, setConfirmLoading] = createSignal(false);

    function handleCloseChannel() {
        setConfirmOpen(true);
    }

    async function confirmCloseChannel() {
        setConfirmLoading(true);
        try {
            await state.mutiny_wallet?.close_channel(
                props.channel.outpoint as string
            );
        } catch (e) {
            console.error(e);
            showToast(eify(e));
        }
        setConfirmLoading(false);
        setConfirmOpen(false);
    }

    return (
        <Collapsible.Root>
            <Collapsible.Trigger class="w-full">
                <h2 class="truncate text-start text-lg font-mono bg-neutral-200 text-black rounded px-4 py-2">
                    {">"} {props.channel.peer}
                </h2>
            </Collapsible.Trigger>
            <Collapsible.Content>
                <VStack>
                    <pre class="overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(props.channel, null, 2)}
                    </pre>
                    <ExternalLink
                        href={mempoolTxUrl(
                            props.channel.outpoint?.split(":")[0],
                            props.network
                        )}
                    >
                        View Transaction
                    </ExternalLink>
                    <Button
                        intent="glowy"
                        layout="xs"
                        onClick={handleCloseChannel}
                    >
                        Close Channel
                    </Button>
                </VStack>
                <ConfirmDialog
                    open={confirmOpen()}
                    onConfirm={confirmCloseChannel}
                    onCancel={() => setConfirmOpen(false)}
                    loading={confirmLoading()}
                >
                    <p>Are you sure you want to close this channel?</p>
                </ConfirmDialog>
            </Collapsible.Content>
        </Collapsible.Root>
    );
}

function ChannelsList() {
    const [state, _] = useMegaStore();

    const getChannels = async () => {
        return (await state.mutiny_wallet?.list_channels()) as Promise<
            MutinyChannel[]
        >;
    };

    const [channels, { refetch }] = createResource(getChannels);

    const network = state.mutiny_wallet?.get_network() as Network;

    return (
        <>
            <InnerCard title="Channels">
                {/* By wrapping this in a suspense I don't cause the page to jump to the top */}
                <Suspense>
                    <For each={channels()} fallback={<code>No channels</code>}>
                        {(channel) => (
                            <ChannelItem channel={channel} network={network} />
                        )}
                    </For>
                </Suspense>
                <Button
                    type="button"
                    layout="small"
                    onClick={(e) => {
                        e.preventDefault();
                        refetch();
                    }}
                >
                    Refresh Channels
                </Button>
            </InnerCard>
            <OpenChannel refetchChannels={refetch} />
        </>
    );
}

function OpenChannel(props: { refetchChannels: RefetchChannelsListType }) {
    const [state, _] = useMegaStore();

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

            const nodes = await state.mutiny_wallet?.list_nodes();
            const firstNode = (nodes[0] as string) || "";

            const new_channel = await state.mutiny_wallet?.open_channel(
                firstNode,
                pubkey,
                bigAmount
            );

            setNewChannel(new_channel);

            await props.refetchChannels();

            setAmount("");
            setPeerPubkey("");
        } catch (e) {
            setCreationError(eify(e));
        }
    };

    const network = state.mutiny_wallet?.get_network() as Network;

    return (
        <>
            <InnerCard>
                <form class="flex flex-col gap-4" onSubmit={onSubmit}>
                    <TextField.Root
                        value={peerPubkey()}
                        onChange={setPeerPubkey}
                        class="flex flex-col gap-2"
                    >
                        <TextField.Label class="text-sm font-semibold uppercase">
                            Pubkey
                        </TextField.Label>
                        <TextField.Input class="w-full p-2 rounded-lg text-black" />
                    </TextField.Root>
                    <TextField.Root
                        value={amount()}
                        onChange={setAmount}
                        class="flex flex-col gap-2"
                    >
                        <TextField.Label class="text-sm font-semibold uppercase">
                            Amount
                        </TextField.Label>
                        <TextField.Input
                            type="number"
                            class="w-full p-2 rounded-lg text-black"
                        />
                    </TextField.Root>
                    <Button layout="small" type="submit">
                        Open Channel
                    </Button>
                </form>
            </InnerCard>
            <Show when={newChannel()}>
                <pre class="overflow-x-auto whitespace-pre-wrap break-all">
                    {JSON.stringify(newChannel()?.outpoint, null, 2)}
                </pre>
                <pre>{newChannel()?.outpoint}</pre>
                <ExternalLink
                    href={mempoolTxUrl(
                        newChannel()?.outpoint?.split(":")[0],
                        network
                    )}
                >
                    View Transaction
                </ExternalLink>
            </Show>
            <Show when={creationError()}>
                <pre>{creationError()?.message}</pre>
            </Show>
        </>
    );
}

function LnUrlAuth() {
    const [state, _] = useMegaStore();

    const [value, setValue] = createSignal("");

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        const lnurl = value().trim();
        await state.mutiny_wallet?.lnurl_auth(0, lnurl);

        setValue("");
    };

    return (
        <InnerCard>
            <form class="flex flex-col gap-4" onSubmit={onSubmit}>
                <TextField.Root
                    value={value()}
                    onChange={setValue}
                    validationState={
                        value() == "" ||
                        value().toLowerCase().startsWith("lnurl")
                            ? "valid"
                            : "invalid"
                    }
                    class="flex flex-col gap-4"
                >
                    <TextField.Label class="text-sm font-semibold uppercase">
                        LNURL Auth
                    </TextField.Label>
                    <TextField.Input
                        class="w-full p-2 rounded-lg text-black"
                        placeholder="LNURL..."
                    />
                    <TextField.ErrorMessage class="text-red-500">
                        Expecting something like LNURL...
                    </TextField.ErrorMessage>
                </TextField.Root>
                <Button layout="small" type="submit">
                    Auth
                </Button>
            </form>
        </InnerCard>
    );
}

function ListNodes() {
    const [state, _] = useMegaStore();

    const getNodeIds = async () => {
        const nodes = await state.mutiny_wallet?.list_nodes();
        return nodes as string[];
    };

    const [nodeIds] = createResource(getNodeIds);

    return (
        <InnerCard title="Nodes">
            <Suspense>
                <For each={nodeIds()} fallback={<code>No nodes</code>}>
                    {(nodeId) => <MiniStringShower text={nodeId} />}
                </For>
            </Suspense>
        </InnerCard>
    );
}

export default function KitchenSink() {
    return (
        <>
            <Logs />
            <Hr />
            <ListNodes />
            <Hr />
            <NostrWalletConnectModal />
            <Hr />
            <PeersList />
            <Hr />
            <ChannelsList />
            <Hr />
            <LnUrlAuth />
            <Hr />
            <ResyncOnchain />
            <Hr />
            <Restart />
            <Hr />
            <ImportExport />
            <Hr />
        </>
    );
}
