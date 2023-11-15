import { TextField } from "@kobalte/core";
import { MutinyWallet, OracleAnnouncement } from "@mutinywallet/mutiny-wasm";
import { createEffect, createSignal, For, Show } from "solid-js";

import {
    AmountCard,
    BackLink,
    Button,
    DefaultMain,
    DLCsList,
    InnerCard,
    LargeHeader,
    MiniStringShower,
    MutinyWalletGuard,
    NavBar,
    SafeArea,
    SimpleDialog
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";

type CreateDlcState = "start" | "amount" | "payouts" | "confirm";

type OutcomePayout = {
    outcome: string;
    payout: {
        offer: number;
        accept: number;
    };
};

function PayoutSlider(
    disabled: boolean,
    outcome: string,
    payouts: OutcomePayout[],
    max: number,
    setSliderValue: (outcome: string, value: string) => void
) {
    return (
        <>
            <datalist id="tickmarks">
                <option value="0"/>
                <option value={max / 2}/>
                <option value={max}/>
            </datalist>
            <label for={outcome}>{outcome}</label>
            <input
                disabled={disabled}
                type="range"
                id={outcome}
                name={outcome}
                value={
                    payouts.find((op) => op.outcome == outcome)?.payout.offer ||
                    0
                }
                min="0"
                max={max}
                list="tickmarks"
                onChange={(e) => setSliderValue(outcome, e.currentTarget.value)}
            />
        </>
    );
}

export function DLC() {
    const i18n = useI18n();
    const [state, _] = useMegaStore();

    const [pubkey, setPubkey] = createSignal("");
    const [oracleAnn, setOracleAnn] = createSignal("");
    const [amountSats, setAmountSats] = createSignal<number>(0);
    const [payouts, setPayouts] = createSignal<OutcomePayout[]>([]);
    const [creationState, setCreationState] =
        createSignal<CreateDlcState>("start");
    const [decodedAnnouncement, setDecodedAnnouncement] = createSignal<
        OracleAnnouncement | undefined
    >(undefined);

    // Handle state changes
    createEffect(() => {
        if (creationState() == "start" && oracleAnn().length > 0) {
            // todo handle errors
            const decoded = MutinyWallet.decode_oracle_announcement(
                oracleAnn()
            );
            setDecodedAnnouncement(decoded);
            setCreationState("amount");
        } else if (creationState() == "amount" && amountSats() > 0) {
            const payouts: OutcomePayout[] =
                decodedAnnouncement()!.outcomes.map((outcome) => ({
                    outcome,
                    payout: {
                        offer: amountSats(),
                        accept: amountSats()
                    }
                }));
            setPayouts(payouts);
            setCreationState("payouts");
        }
    });

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        const pk = pubkey().trim();
        const oracle = oracleAnn().trim();
        const size = amountSats();
        const outcomePayouts = payouts();

        console.log("Sending DLC offer: " + JSON.stringify(outcomePayouts));

        const id = await state.mutiny_wallet?.send_dlc_offer(
            BigInt(size),
            { outcomePayouts },
            oracle,
            pk
        );

        // clear state
        setPubkey("");
        setOracleAnn("");
        setAmountSats(0);
        setPayouts([]);
        setCreationState("start");
        setDecodedAnnouncement(undefined);

        console.log("DLC contract id: " + id || "none");
    };

    const onSetPayouts = async (e: SubmitEvent) => {
        e.preventDefault();
        console.log("Setting payouts");
        setCreationState("confirm");
    };

    const setSliderValue = (outcome: string, value: string) => {
        const outcomePayouts = payouts();
        const payout = outcomePayouts.find((op) => op.outcome == outcome);
        if (payout) {
            const index = outcomePayouts.indexOf(payout);
            payout.payout.offer = Number(value);
            // accept payout is amountsSats * 2 - offer, we multiply by 2 since both parties need to put up the same amount
            payout.payout.accept = Number(amountSats()) * 2 - Number(value);
            outcomePayouts[index] = payout;
            console.log("Setting payouts: " + JSON.stringify(outcomePayouts));
            setPayouts(outcomePayouts);
        }
    };

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink
                        href="/settings"
                        title={i18n.t("settings.header")}
                    />
                    <LargeHeader>DLC Testing</LargeHeader>
                    <SimpleDialog
                        open={creationState() == "payouts"}
                        title="Payouts"
                    >
                        <form
                            class="flex flex-col gap-4"
                            onSubmit={onSetPayouts}
                        >
                            <For
                                each={decodedAnnouncement()?.outcomes || []}
                                fallback={
                                    <code>
                                        Error parsing Oracle Announcement
                                    </code>
                                }
                            >
                                {(outcome) =>
                                    PayoutSlider(
                                        false,
                                        outcome,
                                        payouts(),
                                        Number(amountSats()) * 2,
                                        setSliderValue
                                    )
                                }
                            </For>
                            <Button layout="small" type="submit">
                                Set Payouts
                            </Button>
                        </form>
                    </SimpleDialog>
                    <InnerCard>
                        <LargeHeader>Create DLC Offer</LargeHeader>
                        <form class="flex flex-col gap-4" onSubmit={onSubmit}>
                            <TextField.Root
                                value={pubkey()}
                                onChange={setPubkey}
                                class="flex flex-col gap-4"
                            >
                                <TextField.Label class="text-sm font-semibold uppercase">
                                    Pubkey
                                </TextField.Label>
                                <TextField.Input
                                    class="w-full rounded-lg p-2 text-black"
                                    placeholder=""
                                />
                            </TextField.Root>
                            <TextField.Root
                                value={oracleAnn()}
                                onChange={setOracleAnn}
                                class="flex flex-col gap-4"
                            >
                                <TextField.Label class="text-sm font-semibold uppercase">
                                    Oracle Announcement
                                </TextField.Label>
                                <TextField.Input
                                    class="w-full rounded-lg p-2 text-black"
                                    placeholder=""
                                />
                            </TextField.Root>
                            <Show
                                when={
                                    amountSats() > 0 ||
                                    creationState() == "amount"
                                }
                            >
                                <AmountCard
                                    amountSats={amountSats().toString()}
                                    setAmountSats={setAmountSats}
                                    isAmountEditable={
                                        creationState() == "amount"
                                    }
                                    // todo need a min amount, can't do 1 sat DLCs
                                    initialOpen={creationState() == "amount"}
                                />
                            </Show>
                            <Show
                                when={
                                    payouts().length > 0 &&
                                    creationState() == "confirm"
                                }
                            >
                                <For
                                    each={decodedAnnouncement()?.outcomes || []}
                                    fallback={
                                        <code>
                                            Error parsing Oracle Announcement
                                        </code>
                                    }
                                >
                                    {(outcome) =>
                                        PayoutSlider(
                                            true,
                                            outcome,
                                            payouts(),
                                            Number(amountSats()) * 2,
                                            setSliderValue
                                        )
                                    }
                                </For>
                            </Show>
                            <Button
                                layout="small"
                                type="submit"
                                disabled={
                                    creationState() != "confirm" ||
                                    !pubkey()
                                        .trim()
                                        .toLowerCase()
                                        .startsWith("npub1")
                                }
                            >
                                Send Offer
                            </Button>
                        </form>
                    </InnerCard>
                    <DLCsList />
                    <InnerCard>
                        <LargeHeader>My DLC Key:</LargeHeader>
                        <MiniStringShower
                            text={state.mutiny_wallet?.get_dlc_key() || ""}
                        />
                    </InnerCard>
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
