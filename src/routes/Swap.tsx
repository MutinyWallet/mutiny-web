import { createForm, required } from "@modular-forms/solid";
import { MutinyChannel, MutinyPeer } from "@mutinywallet/mutiny-wasm";
import { For, Match, Show, Switch, createResource, createSignal } from "solid-js";
import { AmountCard } from "~/components/AmountCard";
import NavBar from "~/components/NavBar";
import { showToast } from "~/components/Toaster";
import {
  Button,
  Card,
  Checkbox,
  DefaultMain,
  LargeHeader,
  MutinyWalletGuard,
  SafeArea,
  VStack
} from "~/components/layout";
import { BackLink } from "~/components/layout/BackLink";
import { TextField } from "~/components/layout/TextField";
import { MethodChooser, SendSource } from "~/routes/Send";
import { useMegaStore } from "~/state/megaStore";
import eify from "~/utils/eify";
import megaex from "~/assets/icons/megaex.png";
import megacheck from "~/assets/icons/megacheck.png";
import { InfoBox } from "~/components/InfoBox";
import { FullscreenModal } from "~/components/layout/FullscreenModal";
import { useNavigate } from "solid-start";
import mempoolTxUrl from "~/utils/mempoolTxUrl";
import { Network } from "~/logic/mutinyWalletSetup";

const CHANNEL_FEE_ESTIMATE_ADDRESS =
  "bc1qf7546vg73ddsjznzq57z3e8jdn6gtw6au576j07kt6d9j7nz8mzsyn6lgf";

type PeerConnectForm = {
  peer: string;
};

type ChannelOpenDetails = {
  channel?: MutinyChannel;
  failure_reason?: Error;
};

export default function Swap() {
  const [state, actions] = useMegaStore();
  const navigate = useNavigate();

  const [source, setSource] = createSignal<SendSource>("onchain");
  const [amountSats, setAmountSats] = createSignal(0n);
  const [useLsp, setUseLsp] = createSignal(true);
  const [isConnecting, setIsConnecting] = createSignal(false);

  const [selectedPeer, setSelectedPeer] = createSignal<string>("");

  const [channelOpenResult, setChannelOpenResult] = createSignal<ChannelOpenDetails>();

  const feeEstimate = () => {
    if (amountSats()) {
      try {
        return state.mutiny_wallet?.estimate_tx_fee(
          CHANNEL_FEE_ESTIMATE_ADDRESS,
          amountSats(),
          undefined
        );
      } catch (e) {
        console.error(e);
        // showToast(eify(new Error("Unsufficient funds")))
        return undefined;
      }
    }
    return undefined;
  };

  const hasLsp = () => {
    return !!localStorage.getItem("MUTINY_SETTINGS_lsp") || !!import.meta.env.VITE_LSP;
  };

  const getPeers = async () => {
    return (await state.mutiny_wallet?.list_peers()) as Promise<MutinyPeer[]>;
  };

  const [peers, { refetch }] = createResource(getPeers);

  const [_peerForm, { Form, Field }] = createForm<PeerConnectForm>();

  const onSubmit = async (values: PeerConnectForm) => {
    setIsConnecting(true);
    try {
      const peerConnectString = values.peer.trim();
      const nodes = await state.mutiny_wallet?.list_nodes();
      const firstNode = (nodes[0] as string) || "";

      await state.mutiny_wallet?.connect_to_peer(firstNode, peerConnectString);

      await refetch();

      // If peers list contains the peer we just connected to, select it
      const peer = peers()?.find((p) => p.pubkey === peerConnectString.split("@")[0]);

      if (peer) {
        setSelectedPeer(peer.pubkey);
      } else {
        showToast(new Error("Peer not found"));
      }
    } catch (e) {
      showToast(eify(e));
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePeerSelect = (
    e: Event & {
      currentTarget: HTMLSelectElement;
      target: HTMLSelectElement;
    }
  ) => {
    setSelectedPeer(e.currentTarget.value);
  };

  const handleSwap = async () => {
    if (canSwap()) {
      try {
        const nodes = await state.mutiny_wallet?.list_nodes();
        const firstNode = (nodes[0] as string) || "";

        if (useLsp()) {
          const new_channel = await state.mutiny_wallet?.open_channel(
            firstNode,
            undefined,
            amountSats()
          );

          setChannelOpenResult({ channel: new_channel });
        } else {
          const new_channel = await state.mutiny_wallet?.open_channel(
            firstNode,
            selectedPeer(),
            amountSats()
          );

          setChannelOpenResult({ channel: new_channel });
        }
      } catch (e) {
        setChannelOpenResult({ failure_reason: eify(e) });
        // showToast(eify(e))
      }
    }
  };

  const canSwap = () => {
    const balance = (state.balance?.confirmed || 0n) + (state.balance?.unconfirmed || 0n);
    return (!!selectedPeer() || !!useLsp()) && amountSats() >= 10000n && amountSats() <= balance;
  };

  const amountWarning = () => {
    if (amountSats() < 10000n) {
      return "It's just silly to make a channel smaller than 10,000 sats";
    }

    if (
      amountSats() > (state.balance?.confirmed || 0n) + (state.balance?.unconfirmed || 0n) ||
      !feeEstimate()
    ) {
      return "You don't have enough funds to make this channel";
    }

    return undefined;
  };

  const network = state.mutiny_wallet?.get_network() as Network;

  return (
    <MutinyWalletGuard>
      <SafeArea>
        <DefaultMain>
          <BackLink />
          <LargeHeader>Swap to Lightning</LargeHeader>
          <FullscreenModal
            title={channelOpenResult()?.channel ? "Channel Opened" : "Channel Open Failed"}
            confirmText={channelOpenResult()?.channel ? "Nice" : "Too Bad"}
            open={!!channelOpenResult()}
            setOpen={(open: boolean) => {
              if (!open) setChannelOpenResult(undefined);
            }}
            onConfirm={() => {
              setChannelOpenResult(undefined);
              navigate("/");
            }}
          >
            <div class="flex flex-col items-center gap-8 pb-8">
              <Switch>
                <Match when={channelOpenResult()?.failure_reason}>
                  <img src={megaex} alt="fail" class="w-1/2 mx-auto max-w-[30vh] flex-shrink" />

                  <p class="text-xl font-light py-2 px-4 rounded-xl bg-white/10">
                    {channelOpenResult()?.failure_reason?.message}
                  </p>
                </Match>
                <Match when={true}>
                  <img
                    src={megacheck}
                    alt="success"
                    class="w-1/2 mx-auto max-w-[30vh] flex-shrink"
                  />
                  <AmountCard
                    amountSats={channelOpenResult()?.channel?.balance?.toString() || ""}
                    reserve={channelOpenResult()?.channel?.reserve?.toString() || ""}
                  />
                  <Show when={channelOpenResult()?.channel?.outpoint}>
                    <a
                      class=""
                      href={mempoolTxUrl(
                        channelOpenResult()?.channel?.outpoint?.split(":")[0],
                        "signet"
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Mempool Link
                    </a>
                  </Show>
                  {/* <pre>{JSON.stringify(channelOpenResult()?.channel?.value, null, 2)}</pre> */}
                </Match>
              </Switch>
            </div>
          </FullscreenModal>
          <VStack biggap>
            <MethodChooser source={source()} setSource={setSource} both={false} />
            <VStack>
              <Show when={hasLsp()}>
                <Checkbox checked={useLsp()} onChange={setUseLsp} label="Use LSP" />
              </Show>
              <Show when={!useLsp()}>
                <Card>
                  <VStack>
                    <div class="w-full flex flex-col gap-2">
                      <label for="peerselect" class="uppercase font-semibold text-sm">
                        Use existing peer
                      </label>
                      <select
                        name="peerselect"
                        class="bg-black px-4 py-2 rounded truncate w-full"
                        onChange={handlePeerSelect}
                        value={selectedPeer()}
                      >
                        <option value="" class="" selected>
                          Choose a peer
                        </option>
                        <For each={peers()}>
                          {(peer) => (
                            <option value={peer.pubkey}>{peer.alias ?? peer.pubkey}</option>
                          )}
                        </For>
                      </select>
                    </div>
                    <Show when={!selectedPeer()}>
                      <Form onSubmit={onSubmit} class="flex flex-col gap-4">
                        <Field name="peer" validate={[required("")]}>
                          {(field, props) => (
                            <TextField
                              {...props}
                              value={field.value}
                              error={field.error}
                              label="Connect to new peer"
                              placeholder="Peer connect string"
                            />
                          )}
                        </Field>
                        <Button layout="small" type="submit" disabled={isConnecting()}>
                          {isConnecting() ? "Connecting..." : "Connect"}
                        </Button>
                      </Form>
                    </Show>
                  </VStack>
                </Card>
              </Show>
            </VStack>
            <AmountCard
              amountSats={amountSats().toString()}
              setAmountSats={setAmountSats}
              fee={feeEstimate()?.toString()}
              isAmountEditable={true}
            />
            <Show when={amountWarning() && amountSats() > 0n}>
              <InfoBox accent={"red"}>{amountWarning()}</InfoBox>
            </Show>
          </VStack>
          <div class="flex-1" />
          <Button
            class="w-full flex-grow-0"
            disabled={!canSwap()}
            intent="blue"
            onClick={handleSwap}
            loading={false}
          >
            {"Confirm Swap"}
          </Button>
        </DefaultMain>
        <NavBar activeTab="none" />
      </SafeArea>
    </MutinyWalletGuard>
  );
}
