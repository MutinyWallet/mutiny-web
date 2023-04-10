
import App from "~/components/App";
import { Switch, Match } from "solid-js";
import { WaitlistAlreadyIn } from "~/components/waitlist/WaitlistAlreadyIn";
import WaitlistForm from "~/components/waitlist/WaitlistForm";
import ReloadPrompt from "~/components/Reload";
import { useMegaStore } from "~/state/megaStore";
import LoadingSpinner from "~/components/LoadingSpinner";

function FullscreenLoader() {
  return (
    <div class="w-screen h-screen flex justify-center items-center">
      <LoadingSpinner />
    </div>
  );
}

export default function Home() {
  const [state, _] = useMegaStore();

  return (
    <>
      <ReloadPrompt />

      <Switch fallback={<FullscreenLoader />} >
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
