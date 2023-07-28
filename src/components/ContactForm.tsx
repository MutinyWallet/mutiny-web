import { SubmitHandler, createForm, required } from "@modular-forms/solid";
import { Button, LargeHeader, VStack } from "~/components/layout";
import { TextField } from "~/components/layout/TextField";
import { ContactFormValues } from "./ContactViewer";
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
            class="flex flex-col flex-1 justify-around gap-4 max-w-[400px] mx-auto w-full"
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
                    {/* <Field name="npub" validate={[]}>
                        {(field, props) => (
                            <TextField  {...props} placeholder='npub...' value={field.value} error={field.error} label="Nostr npub or NIP-05 (optional)" />
                        )}
                    </Field> */}
                </VStack>
            </div>
            <Button type="submit" intent="blue" class="w-full flex-none">
                {props.cta}
            </Button>
        </Form>
    );
}
