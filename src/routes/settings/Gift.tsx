import {
    createForm,
    getValue,
    required,
    reset,
    setValue,
    SubmitHandler
} from "@modular-forms/solid";
import { NwcProfile } from "@mutinywallet/mutiny-wasm";
import {
    createEffect,
    createResource,
    createSignal,
    For,
    Match,
    Show,
    Suspense,
    Switch
} from "solid-js";

import {
    AmountEditable,
    BackPop,
    Button,
    Collapser,
    ConfirmDialog,
    DefaultMain,
    InfoBox,
    IntegratedQr,
    LargeHeader,
    LoadingSpinner,
    MutinyPlusCta,
    MutinyWalletGuard,
    NavBar,
    NiceP,
    SafeArea,
    SettingsCard,
    TextField,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify, isFreeGiftingDay } from "~/utils";
import { baseUrlAccountingForNative } from "~/utils/baseUrl";
import { createDeepSignal } from "~/utils/deepSignal";

type CreateGiftForm = {
    name: string;
    amount: string;
};

function SingleGift(props: { profile: NwcProfile; onDelete?: () => void }) {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const network = state.mutiny_wallet?.get_network();

    const baseUrl = baseUrlAccountingForNative(network);

    const sharableUrl = () => baseUrl.concat(props.profile.url_suffix || "");
    const amount = () => props.profile.budget_amount?.toString() || "0";

    const [confirmOpen, setConfirmOpen] = createSignal(false);

    const handleConfirmDelete = async () => {
        try {
            await state.mutiny_wallet?.delete_nwc_profile(props.profile.index);
            setConfirmOpen(false);
            props.onDelete && props.onDelete();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <VStack>
            <IntegratedQr
                amountSats={amount()}
                value={sharableUrl()}
                kind="gift"
            />

            <Button intent="red" onClick={() => setConfirmOpen(true)}>
                {i18n.t("settings.gift.send_delete_button")}
            </Button>

            <ConfirmDialog
                loading={false}
                open={confirmOpen()}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmOpen(false)}
            >
                {i18n.t("settings.gift.send_delete_confirm")}
            </ConfirmDialog>
        </VStack>
    );
}

function ExistingGifts() {
    const [state, _actions] = useMegaStore();

    const [giftNWCProfiles, { refetch }] = createResource(async () => {
        try {
            const profiles = await state.mutiny_wallet?.get_nwc_profiles();
            if (!profiles) return [];

            const filteredForGifts = profiles.filter((p) => p.tag === "Gift");

            return filteredForGifts;
        } catch (e) {
            console.error(e);
        }
    });

    return (
        <Show when={giftNWCProfiles() && giftNWCProfiles()!.length > 0}>
            <SettingsCard title={"Existing Gifts"}>
                <For each={giftNWCProfiles()}>
                    {(profile) => (
                        <Collapser title={profile.name} activityLight={"on"}>
                            <SingleGift profile={profile} onDelete={refetch} />
                        </Collapser>
                    )}
                </For>
            </SettingsCard>
        </Show>
    );
}

export function Gift() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const [_error, setError] = createSignal<Error>();

    const [giftResult, setGiftResult] = createSignal<NwcProfile>();

    const [giftForm, { Form, Field }] = createForm<CreateGiftForm>({
        initialValues: {
            name: "",
            amount: "100000"
        }
    });

    function resetGifting() {
        reset(giftForm);
        setGiftResult(undefined);
    }

    const handleSubmit: SubmitHandler<CreateGiftForm> = async (
        f: CreateGiftForm
    ) => {
        const nwc_name = f.name.trim();
        const amount = Number(f.amount);

        try {
            const profile = await state.mutiny_wallet?.create_single_use_nwc(
                nwc_name,
                BigInt(amount)
            );

            setGiftResult(profile);
        } catch (e) {
            console.error(e);
            setError(eify(e));
        }
    };

    async function fetchProfile(gift?: NwcProfile) {
        if (!gift) return;
        try {
            const fresh = await state.mutiny_wallet?.get_nwc_profile(
                gift.index
            );
            return fresh;
        } catch (e) {
            console.error(e);
            // If the gift is not found it means it's been deleted because it was redeemed
            return undefined;
        }
    }

    const [freshProfile, { refetch }] = createResource(
        () => giftResult(),
        fetchProfile,
        {
            storage: createDeepSignal
        }
    );

    createEffect(() => {
        // Should re-run after every sync
        if (!state.is_syncing) {
            refetch();
        }
    });

    const lessThanMinChannelSize = () => {
        return Number(getValue(giftForm, "amount")) < 100000;
    };

    const selfHosted = state.settings?.selfhosted === "true";
    const freeDay = isFreeGiftingDay();

    const canGift = state.mutiny_plus || selfHosted || freeDay;

    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackPop />
                    <Show when={!canGift}>
                        <VStack>
                            <LargeHeader>
                                {i18n.t("settings.gift.send_header")}
                            </LargeHeader>
                            <NiceP>{i18n.t("settings.gift.need_plus")}</NiceP>
                            <MutinyPlusCta />
                        </VStack>
                    </Show>
                    <Show when={giftResult()}>
                        <VStack>
                            <Switch>
                                <Match when={!freshProfile()}>
                                    <LargeHeader>
                                        {i18n.t(
                                            "settings.gift.send_header_claimed"
                                        )}
                                    </LargeHeader>
                                    <NiceP>
                                        {i18n.t("settings.gift.send_claimed")}
                                    </NiceP>
                                </Match>
                                <Match when={true}>
                                    <LargeHeader>
                                        {i18n.t(
                                            "settings.gift.send_sharable_header"
                                        )}
                                    </LargeHeader>
                                    <NiceP>
                                        {i18n.t(
                                            "settings.gift.send_instructions"
                                        )}
                                    </NiceP>
                                    <InfoBox accent="green">
                                        {i18n.t("settings.gift.send_tip")}
                                    </InfoBox>
                                    <SingleGift
                                        profile={freshProfile()!}
                                        onDelete={resetGifting}
                                    />
                                </Match>
                            </Switch>
                            <Button intent="green" onClick={resetGifting}>
                                {i18n.t("settings.gift.send_another")}
                            </Button>
                        </VStack>
                    </Show>
                    <Show when={!giftResult() && canGift}>
                        <LargeHeader>
                            {i18n.t("settings.gift.send_header")}
                        </LargeHeader>
                        <Form onSubmit={handleSubmit}>
                            <VStack>
                                <NiceP>
                                    {i18n.t("settings.gift.send_explainer")}
                                </NiceP>
                                <Field name="amount">
                                    {(field) => (
                                        <AmountEditable
                                            initialAmountSats={
                                                field.value || "0"
                                            }
                                            setAmountSats={(newAmount) =>
                                                setValue(
                                                    giftForm,
                                                    "amount",
                                                    newAmount.toString()
                                                )
                                            }
                                        />
                                    )}
                                </Field>
                                <Field
                                    name="name"
                                    validate={[
                                        required(
                                            i18n.t(
                                                "settings.gift.send_name_required"
                                            )
                                        )
                                    ]}
                                >
                                    {(field, props) => (
                                        <TextField
                                            {...props}
                                            value={field.value}
                                            error={field.error}
                                            label={i18n.t(
                                                "settings.gift.send_name_label"
                                            )}
                                            placeholder="Satoshi Nakamoto"
                                        />
                                    )}
                                </Field>

                                <Show when={lessThanMinChannelSize()}>
                                    <InfoBox accent="green">
                                        {i18n.t(
                                            "settings.gift.send_small_warning"
                                        )}
                                    </InfoBox>
                                </Show>
                                <Button
                                    intent="blue"
                                    type="submit"
                                    loading={giftForm.submitting}
                                >
                                    {i18n.t("settings.gift.send_cta")}
                                </Button>
                            </VStack>
                        </Form>
                        <Suspense fallback={<LoadingSpinner />}>
                            <ExistingGifts />
                        </Suspense>
                    </Show>
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
