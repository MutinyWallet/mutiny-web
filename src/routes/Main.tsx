import { createAsync, useNavigate } from "@solidjs/router";
import { Show, Suspense } from "solid-js";

import {
    Circle,
    DecryptDialog,
    DefaultMain,
    HomeBalance,
    HomePrompt,
    HomeSubnav,
    LabelCircle,
    LoadingIndicator,
    NavBar,
    ReloadPrompt,
    SocialActionRow
} from "~/components";
import { Fab } from "~/components/Fab";
import { useMegaStore } from "~/state/megaStore";

export function WalletHeader(props: { loading: boolean }) {
    const navigate = useNavigate();
    const [state, _actions, sw] = useMegaStore();

    const profile = createAsync(async () => {
        if (props.loading) {
            return undefined;
        }
        return await sw.get_nostr_profile();
    });

    return (
        <header class="grid grid-cols-[auto_minmax(0,_1fr)_auto] items-center gap-4">
            <Suspense
                fallback={
                    <LabelCircle
                        contact
                        label={false}
                        image_url={undefined}
                        onClick={() => navigate("/profile")}
                    />
                }
            >
                <LabelCircle
                    contact
                    label={false}
                    image_url={profile()?.picture}
                    onClick={() => navigate("/profile")}
                />
            </Suspense>
            <HomeBalance />
            <Circle onClick={() => navigate("/settings")}>
                <img
                    src={
                        state.mutiny_plus
                            ? "/m-plus.png"
                            : "/mutiny-pixel-m.png"
                    }
                    alt="mutiny"
                    width={"32px"}
                    height={"32px"}
                    style={{
                        "image-rendering": "pixelated"
                    }}
                />
            </Circle>
        </header>
    );
}

export function Main() {
    const [state] = useMegaStore();

    const navigate = useNavigate();

    return (
        <DefaultMain>
            <Show when={state.load_stage !== "done"}>
                <WalletHeader loading={true} />
                <div class="flex-1" />

                <LoadingIndicator />
                <div class="flex-1" />
            </Show>
            <Show when={state.load_stage === "done"}>
                <WalletHeader loading={false} />

                <Show when={!state.wallet_loading && !state.safe_mode}>
                    <SocialActionRow
                        onScan={() => navigate("/scanner")}
                        onSearch={() => navigate("/search")}
                    />
                </Show>

                {/* <hr class="border-t border-m-grey-700" /> */}
                <ReloadPrompt />
                <HomeSubnav />
            </Show>

            <Fab
                onSearch={() => navigate("/search")}
                onScan={() => navigate("/scanner")}
            />

            <DecryptDialog />
            <HomePrompt />
            <NavBar activeTab="home" />
        </DefaultMain>
    );
}
