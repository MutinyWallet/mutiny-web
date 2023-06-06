import App from "~/components/App";
import { Switch, Match } from "solid-js";
import { WaitlistAlreadyIn } from "~/components/waitlist/WaitlistAlreadyIn";
import WaitlistForm from "~/components/waitlist/WaitlistForm";
import { useMegaStore } from "~/state/megaStore";
import { FullscreenLoader } from "~/components/layout";
import SetupErrorDisplay from "~/components/SetupErrorDisplay";

export default function Home() {
    const [state, _] = useMegaStore();

    return (
        <Switch fallback={<FullscreenLoader />}>
            <Match when={state.setup_error}>
                <SetupErrorDisplay error={state.setup_error!} />
            </Match>
            <Match when={state.user_status === "approved"}>
                <App />
            </Match>
            <Match when={state.user_status === "waitlisted"}>
                <WaitlistAlreadyIn />
            </Match>
            <Match when={state.user_status === "new_here"}>
                <WaitlistForm />
            </Match>
        </Switch>
    );
}
