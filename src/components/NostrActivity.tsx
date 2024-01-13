import { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { useNavigate } from "@solidjs/router";
import { Search } from "lucide-solid";
import {
    createEffect,
    createResource,
    For,
    Match,
    Show,
    Switch
} from "solid-js";

import { ButtonCard, NiceP } from "~/components/layout";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { fetchZaps, getPrimalImageUrl } from "~/utils";
import { timeAgo } from "~/utils/prettyPrintTime";

import { GenericItem } from "./GenericItem";

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

export function NostrActivity() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const [data, { refetch }] = createResource(state.npub, fetchZaps);

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
        const image_url = parsed.image || parsed.picture;
        return getPrimalImageUrl(image_url);
    }

    createEffect(() => {
        // Should re-run after every sync
        if (!state.is_syncing) {
            refetch();
        }
    });

    const navigate = useNavigate();

    // TODO: can this be part of mutiny wallet?
    async function newContactFromHexpub(hexpub: string) {
        try {
            const npub = await MutinyWallet.hexpub_to_npub(hexpub);

            if (!npub) {
                throw new Error("No npub for that hexpub");
            }

            const existingContact =
                await state.mutiny_wallet?.get_contact_for_npub(npub);

            if (existingContact) {
                navigate(`/chat/${existingContact.id}`);
                return;
            }

            const profile = data.latest?.profiles[hexpub];
            if (!profile) return;
            const parsed = JSON.parse(profile.content);
            const name = parsed.display_name || parsed.name || profile.pubkey;
            const image_url = parsed.image || parsed.picture || undefined;
            const ln_address = parsed.lud16 || undefined;
            const lnurl = parsed.lud06 || undefined;

            const contactId = await state.mutiny_wallet?.create_new_contact(
                name,
                npub,
                ln_address,
                lnurl,
                image_url
            );

            if (!contactId) {
                throw new Error("no contact id returned");
            }

            const tagItem = await state.mutiny_wallet?.get_tag_item(contactId);

            if (!tagItem) {
                throw new Error("no contact returned");
            }

            navigate(`/chat/${contactId}`);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div class="flex w-full flex-col divide-y divide-m-grey-800 overflow-x-clip">
            <Show when={!data.latest || data.latest?.zaps.length === 0}>
                <ButtonCard onClick={() => navigate("/search")}>
                    <div class="flex items-center gap-2">
                        <Search class="inline-block text-m-red" />
                        <NiceP>{i18n.t("home.find")}</NiceP>
                    </div>
                </ButtonCard>
            </Show>
            <For each={data.latest?.zaps}>
                {(zap) => (
                    <>
                        <GenericItem
                            primaryAvatarUrl={
                                imageFromHexpub(zap.from_hexpub) || ""
                            }
                            primaryName={
                                zap.kind === "anonymous"
                                    ? i18n.t("activity.anonymous")
                                    : zap.kind === "private"
                                    ? i18n.t("activity.private")
                                    : nameFromHexpub(zap.from_hexpub)
                            }
                            primaryOnClick={() => {
                                newContactFromHexpub(zap.from_hexpub);
                            }}
                            secondaryAvatarUrl={
                                imageFromHexpub(zap.to_hexpub) || ""
                            }
                            secondaryName={nameFromHexpub(zap.to_hexpub)}
                            secondaryOnClick={() => {
                                newContactFromHexpub(zap.to_hexpub);
                            }}
                            verb={"zapped"}
                            amount={zap.amount_sats}
                            message={zap.content ? zap.content : undefined}
                            date={timeAgo(zap.timestamp, data.latest?.until)}
                            visibility={
                                zap.kind === "public" ? "public" : "private"
                            }
                            genericAvatar={
                                zap.kind === "anonymous" ||
                                zap.kind === "private"
                            }
                            forceSecondary
                            link={`https://njump.me/e/${zap.event_id}`}
                        />
                    </>
                )}
            </For>
        </div>
    );
}
