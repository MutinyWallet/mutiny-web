import {
    createForm,
    getValue,
    required,
    setValue,
    SubmitHandler
} from "@modular-forms/solid";
import { NwcProfile } from "@mutinywallet/mutiny-wasm";
import { For, Show } from "solid-js";

import {
    AmountEditable,
    AmountSats,
    Button,
    Checkbox,
    InfoBox,
    KeyValue,
    TextField,
    TinyText,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";

export type BudgetForm = {
    connection_name: string;
    auto_approve: boolean;
    budget_amount: string; // modular forms doesn't like bigint
    interval: "Day" | "Week" | "Month" | "Year";
};

export function NWCBudgetEditor(props: {
    initialProfile?: NwcProfile;
    initialName?: string;
    onSave: (value: BudgetForm) => Promise<void>;
}) {
    const i18n = useI18n();

    const [budgetForm, { Form, Field }] = createForm<BudgetForm>({
        initialValues: {
            connection_name:
                props.initialProfile?.name || props.initialName || "",
            // If there's an initial profile, look at that, otherwise default to false
            auto_approve: props.initialProfile
                ? !props.initialProfile.require_approval
                : false,
            budget_amount:
                props.initialProfile?.budget_amount?.toString() ||
                props.initialProfile?.index === 0
                    ? "21000"
                    : "0",
            interval:
                (props.initialProfile
                    ?.budget_period as BudgetForm["interval"]) ||
                props.initialProfile?.index === 0
                    ? "Month"
                    : "Day"
        },
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
        await props.onSave(f);
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
                            disabled={props.initialProfile?.name !== undefined}
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
                        <KeyValue key={i18n.t("settings.connections.budget")}>
                            <Field name="budget_amount">
                                {(field, _fieldProps) => (
                                    <div class="flex flex-col items-end gap-2">
                                        <Show
                                            when={
                                                props.initialProfile?.tag !==
                                                "Subscription"
                                            }
                                            fallback={
                                                <AmountSats
                                                    amountSats={
                                                        Number(field.value) || 0
                                                    }
                                                />
                                            }
                                        >
                                            <AmountEditable
                                                initialOpen={false}
                                                initialAmountSats={
                                                    field.value || "0"
                                                }
                                                showWarnings={false}
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
                        </KeyValue>
                        <KeyValue
                            key={i18n.t("settings.connections.resets_every")}
                        >
                            <Field name="interval">
                                {(field, fieldProps) => (
                                    <Show
                                        when={
                                            props.initialProfile?.tag !==
                                            "Subscription"
                                        }
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
                    {props.initialProfile
                        ? i18n.t("settings.connections.save_connection")
                        : i18n.t("settings.connections.create_connection")}
                </Button>
            </VStack>
        </Form>
    );
}
