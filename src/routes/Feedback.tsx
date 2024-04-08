import { createForm, required, SubmitHandler } from "@modular-forms/solid";
import { A, useLocation } from "@solidjs/router";
import { MessageSquareText } from "lucide-solid";
import { createSignal, Match, Show, Switch } from "solid-js";

import { ExternalLink, InfoBox, MegaCheck, NavBar } from "~/components";
import {
    BackPop,
    Button,
    ButtonLink,
    DefaultMain,
    LargeHeader,
    NiceP,
    TextField,
    VStack
} from "~/components/layout";
import { useI18n } from "~/i18n/context";
import { eify } from "~/utils";

const FEEDBACK_API = import.meta.env.VITE_FEEDBACK;

export function FeedbackLink(props: { setupError?: boolean }) {
    const i18n = useI18n();
    const location = useLocation();
    return (
        <A
            class="flex items-center gap-2 font-semibold text-m-grey-350 no-underline"
            state={{
                previous: location.pathname,
                // If we're coming from an error page we want to know that so we can hide the navbar
                // TODO: either use actual error info from this or remove and just check for setup error in the navbar component
                setupError: props.setupError
            }}
            href="/feedback"
        >
            {i18n.t("feedback.link")}
            <MessageSquareText class="h-5 w-5" />
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

export function Feedback() {
    const i18n = useI18n();
    const [submitted, setSubmitted] = createSignal(false);
    const location = useLocation();

    const state = location.state as { setupError?: boolean };

    const setupError = state?.setupError || undefined;

    return (
        <DefaultMain>
            <BackPop default="/" />
            <Switch>
                <Match when={submitted()}>
                    <div class="flex h-full flex-col items-center gap-4">
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
            <Show when={!setupError}>
                <NavBar activeTab="send" />
            </Show>
        </DefaultMain>
    );
}
