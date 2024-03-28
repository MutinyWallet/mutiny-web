import { BackLink, DefaultMain, ImportNsecForm } from "~/components";

export function ImportProfileSettings() {
    return (
        <DefaultMain>
            <BackLink title="Back" href="/settings/nostrkeys" />
            <div class="mx-auto flex max-w-[20rem] flex-1 flex-col items-center gap-4">
                <div class="flex-1" />
                <h1 class="text-3xl font-semibold">Import nostr profile</h1>
                <p class="text-center text-xl font-light text-neutral-200">
                    Login with an existing nostr account.
                    <br />
                </p>
                <div class="flex-1" />
                <ImportNsecForm />
                <div class="flex-1" />
            </div>
        </DefaultMain>
    );
}
