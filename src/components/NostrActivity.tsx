import {
    createEffect,
    createResource,
    For,
    Match,
    Show,
    Switch
} from "solid-js";

import rightArrow from "~/assets/icons/right-arrow.svg";
import { AmountSats, VStack } from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { fetchZaps, hexpubFromNpub } from "~/utils";
import { timeAgo } from "~/utils/prettyPrintTime";

export function Avatar(props: { image_url?: string; large?: boolean }) {
    return (
        <div
            class="flex h-[3rem] w-[3rem] flex-none items-center justify-center self-center overflow-clip rounded-full border-b border-t border-b-white/10 border-t-white/50 bg-neutral-700 text-3xl uppercase"
            classList={{
                "h-[6rem] w-[6rem]": props.large
            }}
        >
            <Switch>
                <Match when={props.image_url}>
                    <img src={props.image_url} alt={"image"} />
                </Match>
                <Match when={true}>?</Match>
            </Switch>
        </div>
    );
}

function formatProfileLink(hexpub: string): string {
    return `https://primal.net/p/${hexpub}`;
}

export function NostrActivity() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const [data, { refetch }] = createResource(state.npub, fetchZaps);

    const [userHexpub] = createResource(state.npub, hexpubFromNpub);

    function nameFromHexpub(hexpub: string): string {
        const profile = data.latest?.profiles[hexpub];
        if (!profile) return hexpub;
        const parsed = JSON.parse(profile.content);
        const name = parsed.display_name || parsed.name;
        return name;
    }

    function imageFromHexpub(hexpub: string): string | undefined {
        const profile = data.latest?.profiles[hexpub];
        if (!profile) return;
        const parsed = JSON.parse(profile.content);
        const image_url = parsed.picture;
        return image_url;
    }

    createEffect(() => {
        // Should re-run after every sync
        if (!state.is_syncing) {
            refetch();
        }
    });

    return (
        <VStack>
            <For each={data.latest?.zaps}>
                {(zap) => (
                    <div
                        class="rounded-lg bg-m-grey-800 p-2"
                        classList={{
                            "outline outline-m-blue":
                                userHexpub() === zap.to_hexpub
                        }}
                    >
                        <div class="grid grid-cols-[1fr_auto_1fr] gap-4">
                            <div class="grid gap-2 sm:grid-cols-[auto_1fr] sm:items-center">
                                <Avatar
                                    image_url={imageFromHexpub(zap.from_hexpub)}
                                />
                                <span class="truncate whitespace-nowrap text-left text-sm font-semibold uppercase">
                                    <Switch>
                                        <Match when={zap.kind === "public"}>
                                            <a
                                                href={formatProfileLink(
                                                    zap.from_hexpub
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="no-underline"
                                            >
                                                {nameFromHexpub(
                                                    zap.from_hexpub
                                                )}
                                            </a>
                                        </Match>
                                        <Match when={zap.kind === "private"}>
                                            {i18n.t("activity.private")}
                                        </Match>
                                        <Match when={zap.kind === "anonymous"}>
                                            {i18n.t("activity.anonymous")}
                                        </Match>
                                    </Switch>
                                </span>
                            </div>
                            <div class="flex flex-col items-center justify-center">
                                <div class="flex items-center gap-1">
                                    <AmountSats amountSats={zap.amount_sats} />
                                    <img
                                        src={rightArrow}
                                        alt="right arrow"
                                        class="h-4 w-4"
                                    />
                                </div>
                                <time class="text-sm text-m-grey-400">
                                    <Show
                                        when={zap.event_id}
                                        fallback={timeAgo(
                                            zap.timestamp,
                                            data.latest?.until
                                        )}
                                    >
                                        <a
                                            href={`https://primal.net/e/${zap.event_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {timeAgo(
                                                zap.timestamp,
                                                data.latest?.until
                                            )}
                                        </a>
                                    </Show>
                                </time>
                            </div>
                            <div class="grid gap-2 self-end sm:grid-cols-[1fr_auto] sm:items-center ">
                                <div class="self-right flex justify-end">
                                    <Avatar
                                        image_url={imageFromHexpub(
                                            zap.to_hexpub
                                        )}
                                    />
                                </div>
                                <a
                                    href={formatProfileLink(zap.to_hexpub)}
                                    class="truncate whitespace-nowrap text-right text-sm font-semibold uppercase no-underline sm:-order-1 sm:text-right"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {nameFromHexpub(zap.to_hexpub)}
                                </a>
                            </div>
                        </div>
                        <Show when={zap.content}>
                            <hr class="my-2 border-m-grey-750" />
                            <p
                                class="truncate text-center text-sm font-light text-neutral-200"
                                textContent={zap.content}
                            />
                        </Show>
                    </div>
                )}
            </For>
        </VStack>
    );
}
