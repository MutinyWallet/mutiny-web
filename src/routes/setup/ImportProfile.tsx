import { BackLink, DefaultMain, ImportNsecForm } from "~/components";
import { useI18n } from "~/i18n/context";

export function ImportProfile() {
    const i18n = useI18n();
    return (
        <DefaultMain>
            <BackLink title="Back" showOnDesktop href="/newprofile" />
            <div class="mx-auto flex max-w-[20rem] flex-1 flex-col items-center gap-4">
                <div class="flex-1" />
                <h1 class="text-3xl font-semibold">
                    {i18n.t("setup.import.title")}
                </h1>
                <p class="text-center text-xl font-light text-neutral-200">
                    {i18n.t("setup.import.description")}
                    <br />
                </p>
                <div class="flex-1" />
                <ImportNsecForm />
                <div class="flex-1" />
            </div>
        </DefaultMain>
    );
}
