import { WifiOff } from "lucide-solid";

import { Button, DefaultMain } from "~/components/layout";
import { useI18n } from "~/i18n/context";

export function NoConnection() {
    const i18n = useI18n();
    return (
        <DefaultMain>
            <div class="mx-auto flex max-w-[20rem] flex-1 flex-col items-center gap-4">
                <div class="flex-1" />
                <WifiOff class="h-8 w-8" />
                <h1 class="text-center text-3xl font-semibold">
                    {i18n.t("no_connection.title")}
                </h1>
                <p class="text-center text-xl font-light text-m-grey-350">
                    {i18n.t("no_connection.prompt")}
                </p>
                <div class="flex-1" />
                <Button layout="full" onClick={() => window.location.reload()}>
                    {i18n.t("no_connection.reload")}
                </Button>
            </div>
        </DefaultMain>
    );
}
