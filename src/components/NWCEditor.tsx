import {
    createForm,
    getValue,
    required,
    setValue,
    SubmitHandler
} from "@modular-forms/solid";
import { BudgetPeriod, NwcProfile, TagItem } from "@mutinywallet/mutiny-wasm";
import {
    createMemo,
    createResource,
    For,
    Match,
    ResourceFetcher,
    Show,
    Switch
} from "solid-js";

import {
    AmountEditable,
    AmountSats,
    Avatar,
    Button,
    Checkbox,
    InfoBox,
    KeyValue,
    LoadingShimmer,
    TextField,
    TinyText,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { fetchNostrProfile } from "~/utils";

type BudgetInterval = "Day" | "Week" | "Month" | "Year";
type BudgetForm = {
    connection_name: string;
    auto_approve: boolean;
    budget_amount: string; // modular forms doesn't like bigint
    interval: BudgetInterval;
    profileIndex?: number;
    nwaString?: string;
};

type FormMode = "createnwa" | "createnwc" | "editnwc";
type BudgetMode = "fixed" | "editable";

function parseNWA(nwaString?: string) {
    if (!nwaString) return undefined;
    const nwa = decodeURI(nwaString);
    if (nwa) {
        // Examples:
        // Mainnet
        // nostr+walletauth://a957bc527d4b7cea5134308412719fa675671ed38eb313adcf89b96c6982480e?relay=wss%3A%2F%2Frelay.damus.io%2F&secret=a2522b4c6d6ae729&required_commands=pay_invoice&budget=21%2Fday&identity=04c915daefee38317fa734444acee390a8269fe5810b2241e5e6dd343dfbecc9
        // Signet
        // nostr+walletauth://e9a09c45e3d412d694796041e45cb0ab8b92edbceec459ae76376b98111c9a3c?relay=wss%3A%2F%2Frelay.damus.io%2F&secret=5f894e2db96e0c63&required_commands=pay_invoice&budget=21%2Fday&identity=024f93e1890e9e470fb729ea24426766508c0e0c5618b5b475f2d027d0814d09
        const url = new URL(nwa);
        return {
            budget: url.searchParams.get("budget"),
            identity: url.searchParams.get("identity"),
            required_commands: url.searchParams.get("required_commands")
        };
    }
}

// nwa is "day" but waila parses it as "daily"
function mapNwaInterval(interval: string): BudgetInterval | undefined {
    switch (interval) {
        case "day":
        case "daily":
            return "Day";
        case "week":
        case "weekly":
            return "Week";
        case "month":
        case "monthly":
            return "Month";
        case "year":
        case "yearly":
            return "Year";
        default:
            return undefined;
    }
}

function mapIntervalToBudgetPeriod(
    interval: "Day" | "Week" | "Month" | "Year"
): BudgetPeriod {
    switch (interval) {
        case "Day":
            return 0;
        case "Week":
            return 1;
        case "Month":
            return 2;
        case "Year":
            return 3;
    }
}

export function NWCEditor(props: {
    initialProfileIndex?: number;
    initialNWA?: string;
    onSave: (indexToOpen?: number, nwcUriForCallback?: string) => Promise<void>;
}) {
    const [state] = useMegaStore();
    const i18n = useI18n();

    const nwa = createMemo(() => parseNWA(props.initialNWA));

    const formMode = createMemo(() => {
        const mode: "createnwa" | "createnwc" | "editnwc" = nwa()
            ? "createnwa"
            : props.initialProfileIndex
              ? "editnwc"
              : "createnwc";
        return mode;
    });

    // NWA HANDLING SECTION

    // for "createNwa" we need to parse the nwa and fetch the nostr profile if applicable
    const [nostrProfile] = createResource(
        () => nwa()?.identity,
        fetchNostrProfile
    );

    const name = createMemo(() => {
        if (!nostrProfile.latest) return;
        const parsed = JSON.parse(nostrProfile.latest.content);
        const name = parsed.display_name || parsed.name;
        return name;
    });

    const image = createMemo(() => {
        if (!nostrProfile.latest) return;
        const parsed = JSON.parse(nostrProfile.latest.content);
        const image_url = parsed.picture;
        return image_url;
    });

    const parsedBudget = createMemo(() => {
        if (!nwa()?.budget) return;
        const [amount, interval] = nwa()!.budget!.split("/");
        return {
            amount,
            interval: mapNwaInterval(interval)
        };
    });

    async function createNwa(f: BudgetForm) {
        if (!f.nwaString) throw new Error("We lost the NWA string!");
        try {
            await state.mutiny_wallet?.approve_nostr_wallet_auth(
                f.connection_name || "Nostr Wallet Auth",
                // can we do better than ! here?
                f.nwaString
            );
        } catch (e) {
            console.error(e);
        } finally {
            props.onSave();
        }
    }
    // END NWA HANDLING SECTION

    // REGULAR NWC STUFF
    // If the profile has a label we can fetch the contact for showing the profile image

    const nwcProfileFetcher: ResourceFetcher<
        number,
        NwcProfile | undefined
    > = async (index, _last) => {
        console.log("fetching nwc profile", index);
        if (!index) return undefined;

        try {
            const profile: NwcProfile | undefined =
                await state.mutiny_wallet?.get_nwc_profile(index);
            console.log(profile);
            return profile;
        } catch (e) {
            console.error(e);
            return undefined;
        }
    };

    const [profile] = createResource(
        props.initialProfileIndex,
        nwcProfileFetcher
    );

    // TODO: this should get the contact so we can get the image, but not getting a contact tagged on the nwc right now
    const contactFetcher: ResourceFetcher<string, TagItem | undefined> = async (
        label,
        _last
    ) => {
        console.log("fetching contact", label);
        if (!label) return undefined;

        try {
            const contact: TagItem | undefined =
                await state.mutiny_wallet?.get_tag_item(label);
            return contact;
        } catch (e) {
            console.error(e);
            return undefined;
        }
    };

    const [contact] = createResource(profile()?.label, contactFetcher);

    async function saveConnection(f: BudgetForm) {
        let newProfile: NwcProfile | undefined = undefined;
        if (!f.profileIndex) throw new Error("No profile index!");
        if (!f.auto_approve || f.budget_amount === "0") {
            newProfile =
                await state.mutiny_wallet?.set_nwc_profile_require_approval(
                    f.profileIndex
                );
        } else {
            newProfile = await state.mutiny_wallet?.set_nwc_profile_budget(
                f.profileIndex,
                BigInt(f.budget_amount),
                mapIntervalToBudgetPeriod(f.interval)
            );
        }

        if (!newProfile) {
            // This will be caught by the form
            throw new Error(i18n.t("settings.connections.error_connection"));
        } else {
            // Remember the index so the collapser is open after creation
            props.onSave(newProfile.index);
        }
    }

    async function createConnection(f: BudgetForm) {
        let newProfile: NwcProfile | undefined = undefined;

        if (!f.auto_approve || f.budget_amount === "0") {
            newProfile = await state.mutiny_wallet?.create_nwc_profile(
                f.connection_name
            );
        } else {
            newProfile = await state.mutiny_wallet?.create_budget_nwc_profile(
                f.connection_name,
                BigInt(f.budget_amount),
                mapIntervalToBudgetPeriod(f.interval),
                undefined
            );
        }

        if (!newProfile) {
            throw new Error(i18n.t("settings.connections.error_connection"));
        } else {
            if (newProfile.nwc_uri) {
                props.onSave(newProfile.index, newProfile.nwc_uri);
            } else {
                props.onSave(newProfile.index);
            }
        }
    }

    return (
        <Switch>
            <Match when={formMode() === "createnwc"}>
                <NWCEditorForm
                    initialValues={{
                        connection_name: "",
                        auto_approve: false,
                        budget_amount: "0",
                        interval: "Day"
                    }}
                    formMode={formMode()}
                    budgetMode="editable"
                    onSave={createConnection}
                />
            </Match>
            <Match when={formMode() === "createnwa"}>
                <Show
                    when={nwa()?.identity ? nostrProfile()?.content : true}
                    fallback={<LoadingShimmer />}
                >
                    <Avatar large image_url={image()} />
                    <NWCEditorForm
                        initialValues={{
                            connection_name: name(),
                            auto_approve: nwa()?.budget ? true : false,
                            budget_amount:
                                nwa()?.budget && parsedBudget()?.amount
                                    ? parsedBudget()!.amount
                                    : "0",
                            interval: parsedBudget()?.interval ?? "Day",
                            nwaString: props.initialNWA
                        }}
                        formMode={formMode()}
                        budgetMode={nwa()?.budget ? "fixed" : "editable"}
                        onSave={createNwa}
                    />
                </Show>
            </Match>
            <Match when={formMode() === "editnwc"}>
                {/* FIXME: not getting the contact rn */}
                <Show when={profile()}>
                    <Show when={profile()?.label && contact()?.image_url}>
                        <Avatar large image_url={contact()?.image_url} />
                        <pre>{JSON.stringify(contact(), null, 2)}</pre>
                    </Show>
                    <NWCEditorForm
                        initialValues={{
                            connection_name: profile()?.name ?? "",
                            auto_approve: !profile()?.require_approval,
                            budget_amount:
                                profile()?.budget_amount?.toString() ?? "0",
                            interval:
                                (profile()
                                    ?.budget_period as BudgetForm["interval"]) ??
                                "Day",
                            profileIndex: profile()?.index
                        }}
                        formMode={formMode()}
                        budgetMode={
                            profile()?.tag === "Subscription"
                                ? "fixed"
                                : "editable"
                        }
                        onSave={saveConnection}
                    />
                </Show>
            </Match>
        </Switch>
    );
}

function NWCEditorForm(props: {
    initialValues: BudgetForm;
    formMode: FormMode;
    budgetMode: BudgetMode;
    onSave: (f: BudgetForm) => Promise<void>;
}) {
    const i18n = useI18n();

    const [budgetForm, { Form, Field }] = createForm<BudgetForm>({
        initialValues: props.initialValues,
        validate: (values) => {
            const errors: Record<string, string> = {};
            if (values.auto_approve && values.budget_amount === "0") {
                errors.budget_amount = i18n.t(
                    "settings.connections.error_budget_zero"
                );
            }
            return errors;
        }
    });

    const handleFormSubmit: SubmitHandler<BudgetForm> = async (
        f: BudgetForm
    ) => {
        // If this throws the message will be caught by the form
        await props.onSave({
            ...f,
            profileIndex: props.initialValues.profileIndex,
            nwaString: props.initialValues.nwaString
        });
    };

    return (
        <Form onSubmit={handleFormSubmit}>
            <VStack>
                <Field
                    name="connection_name"
                    validate={[
                        required(i18n.t("settings.connections.error_name"))
                    ]}
                >
                    {(field, fieldProps) => (
                        <TextField
                            disabled={
                                props.initialValues?.connection_name !== ""
                            }
                            value={field.value}
                            {...fieldProps}
                            name="name"
                            error={field.error}
                            placeholder={i18n.t(
                                "settings.connections.new_connection_placeholder"
                            )}
                        />
                    )}
                </Field>
                <Field name="auto_approve" type="boolean">
                    {(field, _fieldProps) => (
                        <Checkbox
                            checked={field.value || false}
                            label="Auto Approve"
                            onChange={(c) =>
                                setValue(budgetForm, "auto_approve", c)
                            }
                        />
                    )}
                </Field>
                <Show when={getValue(budgetForm, "auto_approve")}>
                    <VStack>
                        <TinyText>
                            {i18n.t("settings.connections.careful")}
                        </TinyText>

                        <Field name="budget_amount">
                            {(field, _fieldProps) => (
                                <div class="flex flex-col items-end gap-2">
                                    <Show
                                        when={props.budgetMode === "editable"}
                                        fallback={
                                            <AmountSats
                                                amountSats={
                                                    Number(field.value) || 0
                                                }
                                            />
                                        }
                                    >
                                        <AmountEditable
                                            initialAmountSats={
                                                field.value || "0"
                                            }
                                            setAmountSats={(a) => {
                                                setValue(
                                                    budgetForm,
                                                    "budget_amount",
                                                    a.toString()
                                                );
                                            }}
                                        />
                                    </Show>
                                    <p class="text-sm text-m-red">
                                        {field.error}
                                    </p>
                                </div>
                            )}
                        </Field>
                        <KeyValue
                            key={i18n.t("settings.connections.resets_every")}
                        >
                            <Field name="interval">
                                {(field, fieldProps) => (
                                    <Show
                                        when={props.budgetMode === "editable"}
                                        fallback={
                                            budgetForm.internal.initialValues
                                                .interval
                                        }
                                    >
                                        <select
                                            {...fieldProps}
                                            class="w-full rounded-lg bg-m-grey-750 py-2 pl-4 pr-12 text-base font-normal text-white"
                                        >
                                            <For
                                                each={[
                                                    {
                                                        label: "Day",
                                                        value: "Day"
                                                    },
                                                    {
                                                        label: "Week",
                                                        value: "Week"
                                                    },
                                                    {
                                                        label: "Month",
                                                        value: "Month"
                                                    },
                                                    {
                                                        label: "Year",
                                                        value: "Year"
                                                    }
                                                ]}
                                            >
                                                {({ label, value }) => (
                                                    <option
                                                        value={value}
                                                        selected={
                                                            field.value ===
                                                            value
                                                        }
                                                    >
                                                        {label}
                                                    </option>
                                                )}
                                            </For>
                                        </select>
                                    </Show>
                                )}
                            </Field>
                        </KeyValue>
                    </VStack>
                </Show>
                <Show when={budgetForm.response.message}>
                    <InfoBox accent="red">
                        {budgetForm.response.message}
                    </InfoBox>
                </Show>
                <Button
                    type="submit"
                    intent="blue"
                    loading={budgetForm.submitting}
                >
                    {props.formMode === "editnwc"
                        ? i18n.t("settings.connections.save_connection")
                        : i18n.t("settings.connections.create_connection")}
                </Button>
            </VStack>
        </Form>
    );
}
