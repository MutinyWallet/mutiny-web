import { Match, Switch } from "solid-js";

import pixelLogo from "~/assets/mutiny-pixel-logo.png";
import plusLogo from "~/assets/mutiny-plus-logo.png";
import { useMegaStore } from "~/state/megaStore";

export function Logo() {
    const [state, _actions] = useMegaStore();
    return (
        <Switch>
            <Match when={state.mutiny_plus}>
                <img
                    id="mutiny-logo"
                    src={plusLogo}
                    class="h-[25px] w-[86px]"
                    alt="Mutiny Plus logo"
                />
            </Match>
            <Match when={true}>
                <img
                    id="mutiny-logo"
                    src={pixelLogo}
                    class="h-[25px] w-[75px]"
                    alt="Mutiny logo"
                />
            </Match>
        </Switch>
    );
}
