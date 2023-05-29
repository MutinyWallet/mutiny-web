import { LoadingSpinner, NiceP } from "./layout"
import {
  For,
  Match,
  Switch,
  createEffect,
  createMemo,
  createResource,
  createSignal,
} from "solid-js"
import { useMegaStore } from "~/state/megaStore"
import { MutinyInvoice } from "@mutinywallet/mutiny-wasm"
import { ActivityItem } from "./ActivityItem"
import { MutinyTagItem } from "~/utils/tags"
import { Network } from "~/logic/mutinyWalletSetup"
import { DetailsModal } from "./DetailsModal"

export const THREE_COLUMNS =
  "grid grid-cols-[auto,1fr,auto] gap-4 py-2 px-2 border-b border-neutral-800 last:border-b-0"
export const CENTER_COLUMN = "min-w-0 overflow-hidden max-w-full"
export const MISSING_LABEL =
  "py-1 px-2 bg-white/10 rounded inline-block text-sm"
export const REDSHIFT_LABEL =
  "py-1 px-2 bg-white text-m-red rounded inline-block text-sm"
export const RIGHT_COLUMN = "flex flex-col items-right text-right max-w-[8rem]"

export type OnChainTx = {
  txid: string
  received: number
  sent: number
  fee?: number
  confirmation_time?: {
    Confirmed?: {
      height: number
      time: number
    }
  }
  labels: string[]
}

export type UtxoItem = {
  outpoint: string
  txout: {
    value: number
    script_pubkey: string
  }
  keychain: string
  is_spent: boolean
  redshifted?: boolean
}

function OnChainItem(props: {
  item: OnChainTx
  labels: MutinyTagItem[]
  network: Network
}) {
  const isReceive = () => props.item.received > props.item.sent

  const [open, setOpen] = createSignal(false)

  return (
    <>
      <DetailsModal open={open()} data={props.item} setOpen={setOpen} />
      <ActivityItem
        kind={"onchain"}
        labels={props.labels}
        // FIXME: is this something we can put into node logic?
        amount={
          isReceive()
            ? props.item.received - props.item.sent
            : props.item.sent - props.item.received
        }
        date={props.item.confirmation_time?.Confirmed?.time}
        positive={isReceive()}
        onClick={() => setOpen(o => !o)}
      />
    </>
  )
}

function InvoiceItem(props: { item: MutinyInvoice; labels: MutinyTagItem[] }) {
  const isSend = createMemo(() => props.item.is_send)

  const [open, setOpen] = createSignal(false)

  return (
    <>
      <DetailsModal open={open()} data={props.item} setOpen={setOpen} />
      <ActivityItem
        kind={"lightning"}
        labels={props.labels}
        amount={props.item.amount_sats || 0n}
        date={props.item.last_updated}
        positive={!isSend()}
        onClick={() => setOpen(o => !o)}
      />
    </>
  )
}

type ActivityItem = {
  type: "onchain" | "lightning"
  item: OnChainTx | MutinyInvoice
  time: number
  labels: MutinyTagItem[]
}

function sortByTime(a: ActivityItem, b: ActivityItem) {
  return b.time - a.time
}

export function CombinedActivity(props: { limit?: number }) {
  const [state, actions] = useMegaStore()

  const getAllActivity = async () => {
    console.log("Getting all activity")
    const txs = (await state.mutiny_wallet?.list_onchain()) as OnChainTx[]
    const invoices =
      (await state.mutiny_wallet?.list_invoices()) as MutinyInvoice[]
    const tags = await actions.listTags()

    let activity: ActivityItem[] = []

    for (let i = 0; i < txs.length; i++) {
      activity.push({
        type: "onchain",
        item: txs[i],
        time: txs[i].confirmation_time?.Confirmed?.time || Date.now(),
        labels: [],
      })
    }

    for (let i = 0; i < invoices.length; i++) {
      if (invoices[i].paid) {
        activity.push({
          type: "lightning",
          item: invoices[i],
          time: Number(invoices[i].last_updated),
          labels: [],
        })
      }
    }

    if (props.limit) {
      activity = activity.sort(sortByTime).slice(0, props.limit)
    } else {
      activity.sort(sortByTime)
    }

    for (let i = 0; i < activity.length; i++) {
      // filter the tags to only include the ones that have an id matching one of the labels
      activity[i].labels = tags.filter((tag) =>
        activity[i].item.labels.includes(tag.id)
      )
    }

    return activity
  }

  const [activity, { refetch }] = createResource(getAllActivity)

  const network = state.mutiny_wallet?.get_network() as Network

  createEffect(() => {
    // After every sync we should refetch the activity
    if (!state.is_syncing) {
      refetch()
    }
  })

  return (
    <Switch>
      <Match when={activity.loading}>
        <LoadingSpinner wide />
      </Match>
      <Match when={activity.state === "ready" && activity().length === 0}>
        <div class="w-full text-center">
          <NiceP>Receive some sats to get started</NiceP>
        </div>
      </Match>
      <Match when={activity.state === "ready" && activity().length >= 0}>
        <For each={activity.latest}>
          {(activityItem) => (
            <Switch>
              <Match when={activityItem.type === "onchain"}>
                <OnChainItem
                  item={activityItem.item as OnChainTx}
                  labels={activityItem.labels}
                  network={network}
                />
              </Match>
              <Match when={activityItem.type === "lightning"}>
                <InvoiceItem
                  item={activityItem.item as MutinyInvoice}
                  labels={activityItem.labels}
                />
              </Match>
            </Switch>
          )}
        </For>
      </Match>
    </Switch>
  );
}
