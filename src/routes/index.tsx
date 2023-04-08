
import App from "~/components/App";
import { Switch, Match } from "solid-js";
import { WaitlistAlreadyIn } from "~/components/waitlist/WaitlistAlreadyIn";
import WaitlistForm from "~/components/waitlist/WaitlistForm";
import ReloadPrompt from "~/components/Reload";
import { useMegaStore } from "~/state/megaStore";

export default function Home() {
  const [state, _] = useMegaStore();

  return (
    <>
      <ReloadPrompt />

      <Switch fallback={<>Loading...</>} >
        {/* TODO: might need this state.node_manager guard on all wallet routes */}
        <Match when={state.user_status === "approved" && state.node_manager}>
          <App />
        </Match>
        <Match when={state.user_status === "waitlisted"}>
          <WaitlistAlreadyIn />
        </Match>
        <Match when={state.user_status === "new_here"}>
          <WaitlistForm />
        </Match>
      </Switch>
    </>

  );
}
