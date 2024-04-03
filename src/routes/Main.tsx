import { createAsync, useNavigate } from "@solidjs/router";
import { createMemo, Show, Suspense } from "solid-js";

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
import { DEFAULT_NOSTR_NAME } from "~/utils";

export function WalletHeader(props: { loading: boolean }) {
    const navigate = useNavigate();
    const [state, _actions] = useMegaStore();

    async function getProfile() {
        const profile = state.mutiny_wallet?.get_nostr_profile();

        return {
            name: profile?.display_name || profile?.name || DEFAULT_NOSTR_NAME,
            picture: profile?.picture || undefined,
            // TODO: this but for real
            lud16: profile?.lud16 || undefined
        };
    }

    const profile = createAsync(() => getProfile());

    const profileImage = createMemo(() => {
        if (props.loading) {
            return undefined;
        }

        if (profile() && profile()!.picture) {
            return profile()!.picture;
        }

        return undefined;
    });

    return (
        <header class="grid grid-cols-[auto_minmax(0,_1fr)_auto] items-center gap-4">
            <LabelCircle
                contact
                label={false}
                image_url={profileImage()}
                onClick={() => navigate("/profile")}
            />
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
    const [state, _actions] = useMegaStore();

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
                <Suspense>
                    <WalletHeader loading={false} />
                </Suspense>

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
