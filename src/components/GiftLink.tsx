import { A, useLocation } from "@solidjs/router";
import { Gift } from "lucide-solid";

import { useI18n } from "~/i18n/context";

export function GiftLink() {
    const i18n = useI18n();
    const location = useLocation();

    return (
        <A
            class="flex items-center gap-2 font-semibold text-m-red no-underline"
            href="/settings/gift"
            state={{
                previous: location.pathname
            }}
        >
            {i18n.t("settings.gift.give_sats_link")}
            <Gift class="h-5 w-5" />
        </A>
    );
}
