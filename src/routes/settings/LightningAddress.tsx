import { Capacitor } from "@capacitor/core";
import {
    createForm,
    custom,
    required,
    reset,
    SubmitHandler
} from "@modular-forms/solid";
import { useNavigate } from "@solidjs/router";
import { Users } from "lucide-solid";
import {
    createMemo,
    createResource,
    createSignal,
    Match,
    Show,
    Suspense,
    Switch
} from "solid-js";

import {
    BackPop,
    Button,
    ButtonCard,
    DefaultMain,
    InfoBox,
    LargeHeader,
    LightningAddressShower,
    MutinyPlusCta,
    MutinyWalletGuard,
    NavBar,
    NiceP,
    TextField,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify } from "~/utils";

type HermesForm = {
    name: string;
};

const validateLowerCase = (value?: string) => {
    if (!value) return false;
    const valid = /^[a-z0-9-_.]+$/;
    return valid.test(value);
};

// todo(paul) put this somewhere else
function HermesForm(props: { onSubmit: (name: string) => void }) {
    const [state, _] = useMegaStore();
    const [error, setError] = createSignal<Error>();
    const [success, setSuccess] = createSignal("");

    const [nameForm, { Form, Field }] = createForm<HermesForm>({
        initialValues: {
            name: ""
        }
    });

    const hermes = import.meta.env.VITE_HERMES;
    if (!hermes) {
        throw new Error("Hermes not configured");
    }
    const hermesDomain = new URL(hermes).hostname;

    const handleSubmit: SubmitHandler<HermesForm> = async (f: HermesForm) => {
        setSuccess("");
        setError(undefined);
        try {
            const name = f.name.trim().toLowerCase();
            const available =
                await state.mutiny_wallet?.check_available_lnurl_name(name);
            if (!available) {
                throw new Error("Name already taken");
            }
            await state.mutiny_wallet?.reserve_lnurl_name(name);
            console.log("lnurl name reserved:", name);

            const formattedName = `${name}@${hermesDomain}`;

            const _ = await state.mutiny_wallet?.edit_nostr_profile(
                undefined,
                undefined,
                // lnurl
                formattedName,
                undefined
            );
            reset(nameForm);
            props.onSubmit(name);
        } catch (e) {
            console.error("Error reserving name:", e);
            setError(eify(e));
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <VStack>
                <Field
                    name="name"
                    validate={[
                        required("Must not be empty"),
                        custom(validateLowerCase, "Address must be lowercase")
                    ]}
                >
                    {(field, props) => (
                        <div class="flex w-full flex-1 gap-2">
                            <div class="flex-1">
                                <TextField
                                    {...props}
                                    {...field}
                                    autoCapitalize="none"
                                    error={field.error}
                                    label={"Nym"}
                                    required
                                />
                            </div>
                            <div class="flex-0 self-start pt-8 text-2xl text-m-grey-350">
                                @{hermesDomain}
                            </div>
                        </div>
                    )}
                </Field>
                <Button
                    loading={nameForm.submitting}
                    disabled={nameForm.invalid}
                    intent="blue"
                    type="submit"
                >
                    Submit
                </Button>
                <Show when={error()}>
                    <InfoBox accent="red">{error()?.message}</InfoBox>
                </Show>
                <Show when={success()}>
                    <InfoBox accent="green">{success()}</InfoBox>
                </Show>
            </VStack>
        </Form>
    );
}

export function LightningAddress() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();
    const navigate = useNavigate();
    const [error, setError] = createSignal<Error>();
    const [settingLnAddress, setSettingLnAddress] = createSignal(false);

    const [lnurlName] = createResource(async () => {
        try {
            const name = await state.mutiny_wallet?.check_lnurl_name();
            return name;
        } catch (e) {
            setError(eify(e));
        }
    });
    const ios = Capacitor.getPlatform() === "ios";

    const hermes = import.meta.env.VITE_HERMES;
    if (!hermes) {
        throw new Error("Hermes not configured");
    }
    const hermesDomain = new URL(hermes).hostname;

    const formattedLnAddress = createMemo(() => {
        const name = lnurlName();
        if (name) {
            return `${lnurlName()}@${hermesDomain}`;
        }
    });

    const profileLnAddress = createMemo(() => {
        if (lnurlName()) {
            const profile = state.mutiny_wallet?.get_nostr_profile();
            if (profile?.lud16) {
                return profile.lud16;
            }
        }
    });

    async function setLnAddress(newAddress: string) {
        if (!newAddress) return;
        try {
            setSettingLnAddress(true);
            setError(undefined);

            const _ = await state.mutiny_wallet?.edit_nostr_profile(
                undefined,
                undefined,
                newAddress,
                undefined
            );
            navigate("/profile");
        } catch (e) {
            console.error("Error setting ln address:", e);
            setError(eify(e));
        }

        setSettingLnAddress(false);
    }

    return (
        <MutinyWalletGuard>
            <DefaultMain>
                <BackPop default="/profile" />
                <LargeHeader>
                    {i18n.t("settings.lightning_address.title")}
                </LargeHeader>
                <NiceP>
                    {i18n.t("settings.lightning_address.description")}
                </NiceP>
                <Show when={error()}>
                    <InfoBox accent="red">{error()?.message}</InfoBox>
                </Show>
                <Suspense>
                    <Switch>
                        <Match when={!state.mutiny_plus && ios}>
                            <InfoBox accent="white">
                                {i18n.t(
                                    "settings.lightning_address.ios_warning"
                                )}
                            </InfoBox>
                        </Match>
                        <Match when={!state.mutiny_plus}>
                            <NiceP>
                                Join <strong>Mutiny+</strong> to get a lightning
                                address.
                            </NiceP>
                            <MutinyPlusCta />
                        </Match>
                        <Match when={!lnurlName() && state.federations?.length}>
                            <HermesForm
                                onSubmit={() => {
                                    navigate("/profile");
                                }}
                            />
                        </Match>
                        <Match
                            when={
                                formattedLnAddress() &&
                                state.federations?.length
                            }
                        >
                            <VStack>
                                <LightningAddressShower
                                    lud16={formattedLnAddress()!}
                                />
                                <Show
                                    when={
                                        profileLnAddress() !==
                                        formattedLnAddress()
                                    }
                                >
                                    <Button
                                        loading={settingLnAddress()}
                                        onClick={() =>
                                            setLnAddress(formattedLnAddress()!)
                                        }
                                    >
                                        Use this address
                                    </Button>
                                </Show>
                            </VStack>
                        </Match>
                        <Match when={true}>
                            <NiceP>
                                {i18n.t(
                                    "settings.lightning_address.add_a_federation"
                                )}
                            </NiceP>
                            <ButtonCard
                                onClick={() =>
                                    navigate("/settings/federations")
                                }
                            >
                                <div class="flex items-center gap-2">
                                    <Users class="inline-block text-m-red" />
                                    <NiceP>
                                        {i18n.t("profile.join_federation")}
                                    </NiceP>
                                </div>
                            </ButtonCard>
                        </Match>
                    </Switch>
                </Suspense>
            </DefaultMain>
            <NavBar activeTab="settings" />
        </MutinyWalletGuard>
    );
}
