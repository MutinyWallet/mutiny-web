import {
    createForm,
    custom,
    email,
    required,
    SubmitHandler
} from "@modular-forms/solid";

import { Button, ContactFormValues, TextField, VStack } from "~/components";
import { useI18n } from "~/i18n/context";
import { hexpubFromNpub } from "~/utils";

const validateNpub = async (value?: string) => {
    if (!value) {
        return false;
    }
    try {
        const hexpub = await hexpubFromNpub(value);
        if (!hexpub) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
};

export function ContactForm(props: {
    handleSubmit: SubmitHandler<ContactFormValues>;
    initialValues?: ContactFormValues;
    cta: string;
}) {
    const i18n = useI18n();
    const [_contactForm, { Form, Field }] = createForm<ContactFormValues>({
        initialValues: props.initialValues
    });

    return (
        <Form
            onSubmit={props.handleSubmit}
            class="mx-auto flex w-full flex-1 flex-col justify-around gap-4"
        >
            <div>
                <VStack>
                    <Field
                        name="name"
                        validate={[required(i18n.t("contacts.error_name"))]}
                    >
                        {(field, props) => (
                            <TextField
                                {...props}
                                placeholder={i18n.t("contacts.placeholder")}
                                value={field.value}
                                error={field.error}
                                label={i18n.t("contacts.name")}
                            />
                        )}
                    </Field>
                    <Field
                        name="ln_address"
                        validate={[
                            required(
                                i18n.t("contacts.error_ln_address_missing")
                            ),
                            email(i18n.t("contacts.email_error"))
                        ]}
                    >
                        {(field, props) => (
                            <TextField
                                {...props}
                                placeholder="example@example.com"
                                value={field.value}
                                error={field.error}
                                label={i18n.t("contacts.ln_address")}
                            />
                        )}
                    </Field>
                    <Field
                        name="npub"
                        validate={[
                            custom(validateNpub, i18n.t("contacts.npub_error"))
                        ]}
                    >
                        {(field, props) => (
                            <TextField
                                {...props}
                                placeholder="npub1..."
                                value={field.value}
                                error={field.error}
                                label={i18n.t("contacts.npub")}
                            />
                        )}
                    </Field>
                </VStack>
            </div>
            <VStack>
                <Button type="submit" intent="blue">
                    {props.cta}
                </Button>
            </VStack>
        </Form>
    );
}
