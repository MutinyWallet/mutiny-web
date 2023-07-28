import {
    SubmitHandler,
    createForm,
    email,
    getValue,
    required,
    setValue
} from "@modular-forms/solid";
import { Match, Show, Switch, createSignal } from "solid-js";
import { A, useLocation } from "solid-start";
import NavBar from "~/components/NavBar";
import {
    Button,
    ButtonLink,
    Checkbox,
    DefaultMain,
    LargeHeader,
    NiceP,
    SafeArea,
    VStack
} from "~/components/layout";
import { BackPop } from "~/components/layout/BackPop";
import { ExternalLink } from "~/components/layout/ExternalLink";
import { StyledRadioGroup } from "~/components/layout/Radio";
import { TextField } from "~/components/layout/TextField";
import feedback from "~/assets/icons/feedback.svg";
import { InfoBox } from "~/components/InfoBox";
import eify from "~/utils/eify";
import { MegaCheck } from "~/components/successfail/MegaCheck";
import { useI18n } from "~/i18n/context";

const FEEDBACK_API = import.meta.env.VITE_FEEDBACK;

export function FeedbackLink(props: { setupError?: boolean }) {
    const i18n = useI18n();
    const location = useLocation();
    return (
        <A
            class="font-semibold no-underline text-m-grey-350 flex gap-2 items-center"
            state={{
                previous: location.pathname,
                // If we're coming from an error page we want to know that so we can hide the navbar
                // TODO: either use actual error info from this or remove and just check for setup error in the navbar component
                setupError: props.setupError
            }}
            href="/feedback"
        >
            {i18n.t("feedback.link")}
            <img src={feedback} class="h-5 w-5" alt="Feedback" />
        </A>
    );
}

type FeedbackForm = {
    include_contact: boolean;
    user_type: "nostr" | "email";
    id: string;
    feedback: string;
    include_logs: boolean;
    images: File[];
};

async function formDataFromFeedbackForm(f: FeedbackForm) {
    const formData = new FormData();

    formData.append("description", JSON.stringify(f.feedback));

    if (f.id) {
        const contact =
            f.user_type === "nostr" ? { nostr: f.id } : { email: f.id };
        formData.append("contact", JSON.stringify(contact));
    }

    // TODO: add back logs and image uploads

    // if (f.include_logs) {
    //     const logs = await MutinyWallet.get_logs();

    //     console.log(logs);

    //     // create a blob
    //     const blob = new Blob([logs], { type: "text/plain" });
    //     // add it to the form data
    //     formData.append("log", blob);
    // }

    // if (f.images.length > 0) {
    //     for (const image of f.images) {
    //         formData.append("image", image);
    //     }
    // }

    if (f.include_contact) {
        const contact =
            f.user_type === "nostr"
                ? { nostr: JSON.stringify(f.id) }
                : { email: JSON.stringify(f.id) };
        formData.append("contact", JSON.stringify(contact));

        formData.append("feedback_type", JSON.stringify("generalcomment"));
    }

    return formData;
}

function FeedbackForm(props: { onSubmitted: () => void }) {
    const i18n = useI18n();
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<Error>();

    const COMMUNICATION_METHODS = [
        {
            value: "nostr",
            label: i18n.t("feedback.nostr"),
            caption: i18n.t("feedback.nostr_caption")
        },
        {
            value: "email",
            label: i18n.t("feedback.email"),
            caption: i18n.t("feedback.email_caption")
        }
    ];

    const [feedbackForm, { Form, Field }] = createForm<FeedbackForm>({
        initialValues: {
            user_type: "nostr",
            id: "",
            feedback: "",
            include_logs: false,
            images: []
        }
    });

    const handleSubmit: SubmitHandler<FeedbackForm> = async (
        f: FeedbackForm
    ) => {
        try {
            setLoading(true);
            const formData = await formDataFromFeedbackForm(f);

            const res = await fetch(`${FEEDBACK_API}/v1/feedback`, {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                throw new Error(
                    i18n.t("feedback.error", { error: `: ${res.statusText}` })
                );
            }

            const json = await res.json();

            if (json.status === "OK") {
                props.onSubmitted();
            } else {
                throw new Error(
                    i18n.t("feedback.error", {
                        error: `. ${i18n.t("feedback.try_again")}`
                    })
                );
            }
        } catch (e) {
            console.error(e);
            setError(eify(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <VStack>
                <Field
                    name="feedback"
                    validate={[required(i18n.t("feedback.invalid_feedback"))]}
                >
                    {(field, props) => (
                        <TextField
                            multiline
                            {...props}
                            value={field.value}
                            error={field.error}
                            placeholder={i18n.t(
                                "feedback.feedback_placeholder"
                            )}
                        />
                    )}
                </Field>
                <Field name="include_contact" type="boolean">
                    {(field, _props) => (
                        <Checkbox
                            checked={field.value || false}
                            label={i18n.t("feedback.info_label")}
                            caption={i18n.t("feedback.info_caption")}
                            onChange={(c) =>
                                setValue(feedbackForm, "include_contact", c)
                            }
                        />
                    )}
                </Field>
                <Show when={getValue(feedbackForm, "include_contact") === true}>
                    <Field name="user_type">
                        {(field, _props) => (
                            // TODO: there's probably a "real" way to do this with modular-forms
                            <StyledRadioGroup
                                value={field.value || "nostr"}
                                onValueChange={(newValue) =>
                                    setValue(
                                        feedbackForm,
                                        "user_type",
                                        newValue as "nostr" | "email"
                                    )
                                }
                                choices={COMMUNICATION_METHODS}
                            />
                        )}
                    </Field>
                    <Switch>
                        <Match
                            when={
                                getValue(feedbackForm, "user_type", {
                                    shouldActive: false
                                }) === "nostr"
                            }
                        >
                            <Field
                                name="id"
                                validate={[
                                    required(i18n.t("feedback.need_contact"))
                                ]}
                            >
                                {(field, props) => (
                                    <TextField
                                        {...props}
                                        value={field.value}
                                        error={field.error}
                                        label={i18n.t("feedback.nostr_label")}
                                        placeholder="npub..."
                                    />
                                )}
                            </Field>
                        </Match>
                        <Match
                            when={
                                getValue(feedbackForm, "user_type", {
                                    shouldActive: false
                                }) === "email"
                            }
                        >
                            <Field
                                name="id"
                                validate={[
                                    required(i18n.t("feedback.need_contact")),
                                    email(i18n.t("feedback.invalid_email"))
                                ]}
                            >
                                {(field, props) => (
                                    <TextField
                                        {...props}
                                        value={field.value}
                                        error={field.error}
                                        type="email"
                                        label={i18n.t("feedback.email")}
                                        placeholder="email@nokycemail.com"
                                    />
                                )}
                            </Field>
                        </Match>
                    </Switch>
                </Show>
                <Show when={error()}>
                    <InfoBox accent="red">{error()?.message}</InfoBox>
                </Show>
                <Button
                    loading={loading()}
                    disabled={
                        !feedbackForm.dirty ||
                        feedbackForm.submitting ||
                        feedbackForm.invalid
                    }
                    intent="blue"
                    type="submit"
                >
                    {i18n.t("feedback.send_feedback")}
                </Button>
            </VStack>
        </Form>
    );
}

export default function Feedback() {
    const i18n = useI18n();
    const [submitted, setSubmitted] = createSignal(false);
    const location = useLocation();

    const state = location.state as { setupError?: boolean };

    const setupError = state?.setupError || undefined;

    return (
        <SafeArea>
            <DefaultMain>
                <BackPop />

                <Switch>
                    <Match when={submitted()}>
                        <div class="flex flex-col gap-4 items-center h-full">
                            <MegaCheck />
                            <LargeHeader centered>
                                {i18n.t("feedback.received")}
                            </LargeHeader>
                            <NiceP>{i18n.t("feedback.thanks")}</NiceP>
                            <ButtonLink intent="blue" href="/" layout="full">
                                {i18n.t("common.home")}
                            </ButtonLink>
                            <Button
                                intent="text"
                                layout="full"
                                onClick={() => setSubmitted(false)}
                            >
                                {i18n.t("feedback.more")}
                            </Button>
                        </div>
                    </Match>
                    <Match when={true}>
                        <LargeHeader>{i18n.t("feedback.header")}</LargeHeader>
                        <NiceP>{i18n.t("feedback.tracking")}</NiceP>
                        <NiceP>
                            {i18n.t("feedback.github")}{" "}
                            <ExternalLink href="https://github.com/MutinyWallet/mutiny-web/issues">
                                {i18n.t("feedback.create_issue")}
                            </ExternalLink>
                        </NiceP>
                        <FeedbackForm onSubmitted={() => setSubmitted(true)} />
                    </Match>
                </Switch>
            </DefaultMain>
            <Show when={!setupError}>
                <NavBar activeTab="send" />
            </Show>
        </SafeArea>
    );
}
