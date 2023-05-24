import { Contact, MutinyBip21RawMaterials, MutinyInvoice } from "@mutinywallet/mutiny-wasm";
import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  Match,
  onCleanup,
  Show,
  Switch
} from "solid-js";
import {
  Button,
  Card,
  DefaultMain,
  Indicator,
  LargeHeader,
  MutinyWalletGuard,
  SafeArea
} from "~/components/layout";
import NavBar from "~/components/NavBar";
import { useMegaStore } from "~/state/megaStore";
import { objectToSearchParams } from "~/utils/objectToSearchParams";
import mempoolTxUrl from "~/utils/mempoolTxUrl";
import { Amount, AmountSmall } from "~/components/Amount";
import { BackLink } from "~/components/layout/BackLink";
import { TagEditor } from "~/components/TagEditor";
import { StyledRadioGroup } from "~/components/layout/Radio";
import { showToast } from "~/components/Toaster";
import { useNavigate } from "solid-start";
import { AmountCard } from "~/components/AmountCard";
import { ShareCard } from "~/components/ShareCard";
import { BackButton } from "~/components/layout/BackButton";
import { MutinyTagItem } from "~/utils/tags";
import { Network } from "~/logic/mutinyWalletSetup";
import { SuccessModal } from "~/components/successfail/SuccessModal";
import { MegaCheck } from "~/components/successfail/MegaCheck";
import { ExternalLink } from "~/components/layout/ExternalLink";
import { CopyableQR } from "~/components/CopyableQR";
import { InfoBox } from "~/components/InfoBox";

type OnChainTx = {
  transaction: {
    version: number;
    lock_time: number;
    input: Array<{
      previous_output: string;
      script_sig: string;
      sequence: number;
      witness: Array<string>;
    }>;
    output: Array<{
      value: number;
      script_pubkey: string;
    }>;
  };
  txid: string;
  received: number;
  sent: number;
  confirmation_time: {
    height: number;
    timestamp: number;
  };
};

const RECEIVE_FLAVORS = [
  { value: "unified", label: "Unified", caption: "Sender decides" },
  { value: "lightning", label: "Lightning", caption: "Fast and cool" },
  { value: "onchain", label: "On-chain", caption: "Just like Satoshi did it" }
];

type ReceiveFlavor = "unified" | "lightning" | "onchain";
type ReceiveState = "edit" | "show" | "paid";
type PaidState = "lightning_paid" | "onchain_paid";

function FeeWarning(props: { fee: bigint; flavor: ReceiveFlavor }) {
  return (
    // TODO: probably won't always be fixed 2500?
    <Show when={props.fee > 1000n}>
      <Switch>
        <Match when={props.flavor === "unified"}>
          <InfoBox accent="green">
            A lightning setup fee of <AmountSmall amountSats={props.fee} /> will be charged if paid
            over lightning.
          </InfoBox>
        </Match>
        <Match when={props.flavor === "lightning"}>
          <InfoBox accent="green">
            A lightning setup fee of <AmountSmall amountSats={props.fee} /> will be charged for this
            receive.
          </InfoBox>
        </Match>
      </Switch>
    </Show>
  );
}

function FeeExplanation(props: { fee: bigint }) {
  return (
    // TODO: probably won't always be a fixed 2500?
    <Switch>
      <Match when={props.fee > 1000n}>
        <InfoBox accent="green">
          A lightning setup fee of <AmountSmall amountSats={props.fee} /> was charged for this
          receive.
        </InfoBox>
      </Match>
      <Match when={props.fee > 0n}>
        <InfoBox accent="green">
          A lightning service fee of <AmountSmall amountSats={props.fee} /> was charged for this
          receive.
        </InfoBox>
      </Match>
    </Switch>
  );
}

export default function Receive() {
  const [state, _actions] = useMegaStore();
  const navigate = useNavigate();

  const [amount, setAmount] = createSignal("");
  const [receiveState, setReceiveState] = createSignal<ReceiveState>("edit");
  const [bip21Raw, setBip21Raw] = createSignal<MutinyBip21RawMaterials>();
  const [unified, setUnified] = createSignal("");
  const [shouldShowAmountEditor, setShouldShowAmountEditor] = createSignal(true);

  const [lspFee, setLspFee] = createSignal(0n);

  // Tagging stuff
  const [selectedValues, setSelectedValues] = createSignal<MutinyTagItem[]>([]);

  // The data we get after a payment
  const [paymentTx, setPaymentTx] = createSignal<OnChainTx>();
  const [paymentInvoice, setPaymentInvoice] = createSignal<MutinyInvoice>();

  // The flavor of the receive
  const [flavor, setFlavor] = createSignal<ReceiveFlavor>("unified");

  const receiveString = createMemo(() => {
    if (unified() && receiveState() === "show") {
      if (flavor() === "unified") {
        return unified();
      } else if (flavor() === "lightning") {
        return bip21Raw()?.invoice ?? "";
      } else if (flavor() === "onchain") {
        return bip21Raw()?.address ?? "";
      }
    }
  });

  function clearAll() {
    setAmount("");
    setReceiveState("edit");
    setBip21Raw(undefined);
    setUnified("");
    setPaymentTx(undefined);
    setPaymentInvoice(undefined);
    setSelectedValues([]);
  }

  async function processContacts(contacts: Partial<MutinyTagItem>[]): Promise<string[]> {
    console.log("Processing contacts", contacts);

    if (contacts.length) {
      const first = contacts![0];

      if (!first.name) {
        console.error("Something went wrong with contact creation, proceeding anyway");
        return [];
      }

      if (!first.id && first.name) {
        console.error("Creating new contact", first.name);
        const c = new Contact(first.name, undefined, undefined, undefined);
        const newContactId = await state.mutiny_wallet?.create_new_contact(c);
        if (newContactId) {
          return [newContactId];
        }
      }

      if (first.id) {
        console.error("Using existing contact", first.name, first.id);
        return [first.id];
      }
    }

    console.error("Something went wrong with contact creation, proceeding anyway");
    return [];
  }

  async function getUnifiedQr(amount: string) {
    const bigAmount = BigInt(amount);
    try {
      const tags = await processContacts(selectedValues());
      const raw = await state.mutiny_wallet?.create_bip21(bigAmount, tags);
      // Save the raw info so we can watch the address and invoice
      setBip21Raw(raw);

      const params = objectToSearchParams({
        amount: raw?.btc_amount,
        lightning: raw?.invoice
      });

      return `bitcoin:${raw?.address}?${params}`;
    } catch (e) {
      showToast(new Error("Couldn't create invoice. Are you asking for enough?"));
      console.error(e);
    }
  }

  async function onSubmit(e: Event) {
    e.preventDefault();

    const unifiedQr = await getUnifiedQr(amount());

    setUnified(unifiedQr || "");
    setReceiveState("show");
    setShouldShowAmountEditor(false);
  }

  async function checkIfPaid(bip21?: MutinyBip21RawMaterials): Promise<PaidState | undefined> {
    if (bip21) {
      console.debug("checking if paid...");
      const lightning = bip21.invoice;
      const address = bip21.address;

      const invoice = await state.mutiny_wallet?.get_invoice(lightning);

      // If the invoice has a fees amount that's probably the LSP fee
      if (invoice?.fees_paid) {
        setLspFee(invoice.fees_paid);
      }

      if (invoice && invoice.paid) {
        setReceiveState("paid");
        setPaymentInvoice(invoice);
        return "lightning_paid";
      }

      const tx = (await state.mutiny_wallet?.check_address(address)) as OnChainTx | undefined;

      if (tx) {
        setReceiveState("paid");
        setPaymentTx(tx);
        return "onchain_paid";
      }
    }
  }

  const [paidState, { refetch }] = createResource(bip21Raw, checkIfPaid);

  const network = state.mutiny_wallet?.get_network() as Network;

  createEffect(() => {
    const interval = setInterval(() => {
      if (receiveState() === "show") refetch();
    }, 1000); // Poll every second
    onCleanup(() => {
      clearInterval(interval);
    });
  });

  return (
    <MutinyWalletGuard>
      <SafeArea>
        <DefaultMain>
          <Show when={receiveState() === "show"} fallback={<BackLink />}>
            <BackButton onClick={() => setReceiveState("edit")} title="Edit" />
          </Show>
          <LargeHeader action={receiveState() === "show" && <Indicator>Checking</Indicator>}>
            Receive Bitcoin
          </LargeHeader>
          <Switch>
            <Match when={!unified() || receiveState() === "edit"}>
              <div class="flex flex-col flex-1 gap-8">
                <AmountCard
                  initialOpen={shouldShowAmountEditor()}
                  amountSats={amount() || "0"}
                  setAmountSats={setAmount}
                  isAmountEditable
                />

                <Card title="Private tags">
                  <TagEditor
                    selectedValues={selectedValues()}
                    setSelectedValues={setSelectedValues}
                    placeholder="Add the sender for your records"
                  />
                </Card>

                <div class="flex-1" />
                <Button
                  class="w-full flex-grow-0"
                  disabled={!amount()}
                  intent="green"
                  onClick={onSubmit}
                >
                  Continue
                </Button>
              </div>
            </Match>
            <Match when={unified() && receiveState() === "show"}>
              <FeeWarning fee={lspFee()} flavor={flavor()} />
              <CopyableQR value={receiveString() ?? ""} />
              <p class="text-neutral-400 text-center">
                <Switch>
                  <Match when={flavor() === "lightning"}>
                    Show or share this invoice with the sender.
                  </Match>
                  <Match when={flavor() === "onchain"}>
                    Show or share this address with the sender.
                  </Match>
                  <Match when={flavor() === "unified"}>
                    Show or share this code with the sender. Sender decides method of payment.
                  </Match>
                </Switch>
              </p>
              <StyledRadioGroup
                small
                value={flavor()}
                onValueChange={setFlavor}
                choices={RECEIVE_FLAVORS}
                accent="white"
              />{" "}
              <ShareCard text={receiveString() ?? ""} />
            </Match>
            <Match when={receiveState() === "paid" && paidState() === "lightning_paid"}>
              <SuccessModal
                title="Payment Received"
                open={!!paidState()}
                setOpen={(open: boolean) => {
                  if (!open) clearAll();
                }}
                onConfirm={() => {
                  clearAll();
                  navigate("/");
                }}
              >
                <MegaCheck />
                <FeeExplanation fee={lspFee()} />
                <Amount amountSats={paymentInvoice()?.amount_sats} showFiat centered />
              </SuccessModal>
            </Match>
            <Match when={receiveState() === "paid" && paidState() === "onchain_paid"}>
              <SuccessModal
                title="Payment Received"
                open={!!paidState()}
                setOpen={(open: boolean) => {
                  if (!open) clearAll();
                }}
                onConfirm={() => {
                  clearAll();
                  navigate("/");
                }}
              >
                <MegaCheck />
                <Amount amountSats={paymentTx()?.received} showFiat centered />
                <ExternalLink href={mempoolTxUrl(paymentTx()?.txid, network)}>
                  View Transaction
                </ExternalLink>
              </SuccessModal>
            </Match>
          </Switch>
        </DefaultMain>
        <NavBar activeTab="receive" />
      </SafeArea>
    </MutinyWalletGuard>
  );
}