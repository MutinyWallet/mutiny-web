import { Match, Switch, createSignal } from "solid-js";
import { Button } from "~/components/layout";
import { StyledRadioGroup } from "../layout/Radio";
import { TextField } from "../layout/TextField";
import { SubmitHandler, createForm, email, getValue, required, setValue } from "@modular-forms/solid";
import { showToast } from "../Toaster";
import eify from "~/utils/eify";
import logo from '~/assets/icons/mutiny-logo.svg';

const WAITLIST_ENDPOINT = "https://waitlist.mutiny-waitlist.workers.dev/waitlist";

const COMMUNICATION_METHODS = [{ value: "nostr", label: "Nostr", caption: "Your freshest npub" }, { value: "email", label: "Email", caption: "Burners welcome" }]

type WaitlistForm = {
    user_type: "nostr" | "email",
    id: string
    comment?: string
}

const initialValues: WaitlistForm = { user_type: "nostr", id: "", comment: "" };

export default function WaitlistForm() {
    const [waitlistForm, { Form, Field }] = createForm<WaitlistForm>({ initialValues });

    const [loading, setLoading] = createSignal(false);

    const newHandleSubmit: SubmitHandler<WaitlistForm> = async (f: WaitlistForm) => {
        console.log(f);

        // TODO: not sure why waitlistForm.submitting doesn't work for me
        // https://modularforms.dev/solid/guides/handle-submission
        setLoading(true)
        try {
            const res = await fetch(WAITLIST_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(f)
            })

            if (res.status !== 200) {
                throw new Error("nope");
            } else {
                // On success set the id in local storage and reload the page
                localStorage.setItem('waitlist_id', f.id);
                window.location.reload();
            }

        } catch (e) {
            if (f.user_type === "nostr") {
                const error = new Error("Something went wrong. Are you sure that's a valid npub?")
                showToast(eify(error))

            } else {
                const error = new Error("Something went wrong. Not sure what.")
                showToast(eify(error))
            }
            return
        } finally {
            setLoading(false)
        }
    }

    return (
        <main class='flex flex-col gap-8 py-8 px-4 max-w-xl mx-auto'>
            <a href="https://mutinywallet.com">
                <img src={logo} class="h-10" alt="logo" />
            </a>
            <h1 class='text-4xl font-bold'>Join Waitlist</h1>
            <h2 class="text-xl">
                Sign up for our waitlist and we'll send a message when Mutiny Wallet is ready for you.
            </h2>
            <Form onSubmit={newHandleSubmit} class="flex flex-col gap-8">
                <Field name="user_type">
                    {(field, props) => (
                        // TODO: there's probably a "real" way to do this with modular-forms
                        <StyledRadioGroup value={field.value || "nostr"} onValueChange={(newValue) => setValue(waitlistForm, "user_type", newValue as "nostr" | "email")} choices={COMMUNICATION_METHODS} />
                    )}
                </Field>
                <Switch>
                    <Match when={getValue(waitlistForm, 'user_type', { shouldActive: false }) === 'nostr'}>
                        <Field name="id"
                            validate={[required("We need some way to contact you")]}
                        >
                            {(field, props) => (
                                <TextField  {...props} value={field.value} error={field.error} label="Nostr npub or NIP-05" placeholder="npub..." />
                            )}
                        </Field>
                    </Match>
                    <Match when={getValue(waitlistForm, 'user_type', { shouldActive: false }) === 'email'}>
                        <Field name="id"
                            validate={[required("We need some way to contact you"), email("That doesn't look like an email address to me")]}
                        >
                            {(field, props) => (
                                <TextField  {...props} value={field.value} error={field.error} label="Email" placeholder="email@nokycemail.com" />
                            )}
                        </Field>
                    </Match>
                </Switch>
                <Field name="comment">
                    {(field, props) => (
                        <TextField multiline {...props} value={field.value} error={field.error} label="Comments" placeholder="I want a lightning wallet that does..." />
                    )}
                </Field>
                <Button loading={loading()} disabled={loading() || !waitlistForm.dirty || waitlistForm.submitting || waitlistForm.invalid} class="self-start" intent="red" type="submit" layout="pad">Submit</Button>
            </Form>
        </main>
    )
}