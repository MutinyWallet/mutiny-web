import {
    createForm,
    email,
    required,
    SubmitHandler
} from "@modular-forms/solid";

import {
    Button,
    ContactFormValues,
    LargeHeader,
    TextField,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";

export function ContactForm(props: {
    handleSubmit: SubmitHandler<ContactFormValues>;
    initialValues?: ContactFormValues;
    title: string;
    cta: string;
}) {
    const i18n = useI18n();
    const [_contactForm, { Form, Field }] = createForm<ContactFormValues>({
        initialValues: props.initialValues
    });

    return (
        <Form
            onSubmit={props.handleSubmit}
            class="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-around gap-4"
        >
            <div>
                <LargeHeader>{props.title}</LargeHeader>
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
                        validate={[email(i18n.t("contacts.email_error"))]}
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
