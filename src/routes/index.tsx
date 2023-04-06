
import App from "~/components/App";
import { Accessor, createEffect, createResource, Setter, createSignal, Switch, Match } from "solid-js";
import { WaitlistAlreadyIn } from "~/components/waitlist/WaitlistAlreadyIn";
import WaitlistForm from "~/components/waitlist/WaitlistForm";
import ReloadPrompt from "~/components/Reload";

function createWaitListSignal(): [Accessor<string>, Setter<string>] {
  const [state, setState] = createSignal("");
  const originalState = localStorage.getItem("waitlist_id")
  if (originalState) {
    setState(localStorage.getItem("waitlist_id") || "");
  }
  createEffect(() => localStorage.setItem("waitlist_id", state()));
  return [state, setState];
}

async function fetchData(source: string) {
  if (source) {
    const data = await fetch(`https://waitlist.mutiny-waitlist.workers.dev/waitlist/${source}`);
    return data.json();
  } else {
    return null
  }
}

export default function Home() {
  // On load, check if the user is already on the waitlist
  const [waitlistId] = createWaitListSignal();
  const [waitlistData] = createResource(waitlistId, fetchData);

  return (
    <>
      <ReloadPrompt />
      <Switch fallback={<>Loading...</>} >
        <Match when={waitlistData() && waitlistData().approval_date}>
          <App />
        </Match>
        <Match when={waitlistData() && waitlistData().date}>
          <WaitlistAlreadyIn />
        </Match>
        <Match when={!waitlistData.loading && !waitlistData()}>
          <WaitlistForm />
        </Match>
      </Switch>
    </>

  );
}
