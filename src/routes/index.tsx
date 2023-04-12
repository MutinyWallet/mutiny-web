
import App from "~/components/App";
import { Switch, Match, Suspense, Show } from "solid-js";
import { WaitlistAlreadyIn } from "~/components/waitlist/WaitlistAlreadyIn";
import WaitlistForm from "~/components/waitlist/WaitlistForm";
import { useMegaStore } from "~/state/megaStore";
import { FullscreenLoader, LoadingSpinner } from "~/components/layout";

export default function Home() {
  const [state, _] = useMegaStore();

  return (
    <>
      <Switch fallback={<FullscreenLoader />} >
        {/* TODO: can you put a suspense around a match? */}
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
    </>

  );
}
