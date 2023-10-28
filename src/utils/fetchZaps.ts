import { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { ResourceFetcher } from "solid-js";

import { useMegaStore } from "~/state/megaStore";
import { hexpubFromNpub, NostrKind, NostrTag } from "~/utils/nostr";

export type NostrEvent = {
    created_at: number;
    content: string;
    tags: NostrTag[];
    kind?: NostrKind | number;
    pubkey: string;
    id?: string;
    sig?: string;
};

export type SimpleZapItem = {
    kind: "public" | "private" | "anonymous";
    from_hexpub: string;
    to_hexpub: string;
    timestamp: bigint;
    amount_sats: bigint;
    note?: string;
    event_id?: string;
    event: NostrEvent;
    content?: string;
};

export type NostrProfile = {
    id: string;
    pubkey: string;
    created_at: number;
    kind: number;
    tags: string[][];
    content: string;
    sig: string;
};

function findByTag(tags: string[][], tag: string): string | undefined {
    if (!tags || !Array.isArray(tags)) return;
    const found = tags.find((t) => {
        if (t[0] === tag) {
            return true;
        }
    });

    if (found) {
        return found[1];
    }
}

async function simpleZapFromEvent(
    event: NostrEvent,
    wallet: MutinyWallet
): Promise<SimpleZapItem | undefined> {
    if (event.kind === 9735 && event.tags?.length > 0) {
        const to = findByTag(event.tags, "p") || "";
        const request = JSON.parse(
            findByTag(event.tags, "description") || "{}"
        );
        const from = request.pubkey;

        const content = request.content;
        const anon = findByTag(request.tags, "anon");

        const bolt11 = findByTag(event.tags, "bolt11") || "";

        if (!bolt11) {
            // not a zap!
            return undefined;
        }

        let amount = 0n;

        // who is the asshole putting "lnbc9m" in all these tags?
        if (bolt11) {
            try {
                // We hardcode the "bitcoin" network because we don't have a good source of mutinynet zaps
                const decoded = await wallet.decode_invoice(bolt11, "bitcoin");
                if (decoded.amount_sats) {
                    amount = decoded.amount_sats;
                } else {
                    console.log("no amount in decoded invoice");
                    return undefined;
                }
            } catch (e) {
                console.error(e);
                return undefined;
            }
        }

        // If we can't get the amount from the invoice we'll fallback to the event tags
        if (amount === 0n && request.tags?.length > 0) {
            amount = BigInt(findByTag(request.tags, "amount") || "0") / 1000n;
        }

        return {
            // If the anon field is empty it's anon, if it has length it's private, otherwise it's public
            kind:
                typeof anon === "string"
                    ? anon.length
                        ? "private"
                        : "anonymous"
                    : "public",
            from_hexpub: from,
            to_hexpub: to,
            timestamp: BigInt(event.created_at),
            amount_sats: amount,
            note: request.id,
            event_id: findByTag(request.tags, "e"),
            event,
            content: content
        };
    }
}

const PRIMAL_API = import.meta.env.VITE_PRIMAL;

export const fetchZaps: ResourceFetcher<
    string,
    {
        follows: string[];
        zaps: SimpleZapItem[];
        profiles: Record<string, NostrProfile>;
        until?: number;
    }
> = async (npub, info) => {
    const [state, _actions] = useMegaStore();

    console.log("fetching zaps for:", npub);
    const follows: string[] = info?.value ? info.value.follows : [];
    const zaps: SimpleZapItem[] = [];
    const profiles: Record<string, NostrProfile> = info.value?.profiles || {};
    let newUntil = undefined;

    if (!PRIMAL_API) throw new Error("Missing PRIMAL_API environment variable");

    // Only have to ask the relays for follows one time
    if (follows.length === 0) {
        let pubkey = undefined;
        try {
            pubkey = await hexpubFromNpub(npub);
        } catch (err) {
            console.error("Failed to get hexpub from npub");
            throw err;
        }

        const response = await fetch(PRIMAL_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify([
                "contact_list",
                { pubkey: pubkey, extended_response: false }
            ])
        });

        if (!response.ok) {
            throw new Error(`Failed to load follows`);
        }

        const data = await response.json();

        for (const event of data) {
            if (event.kind === 3) {
                for (const tag of event.tags) {
                    if (tag[0] === "p") {
                        follows.push(tag[1]);
                    }
                }
            }
        }
    }

    const query = {
        kinds: [9735, 0, 10000113],
        limit: 100,
        pubkeys: follows
    };

    const restPayload = JSON.stringify([
        "zaps_feed",
        // If we have a until value, use it, otherwise don't include it
        info?.value?.until ? { ...query, since: info.value?.until } : query
    ]);

    const response = await fetch(PRIMAL_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: restPayload
    });

    if (!response.ok) {
        throw new Error(`Failed to load zaps`);
    }

    const data = await response.json();

    for (const object of data) {
        if (object.kind === 10000113) {
            const content = JSON.parse(object.content);
            if (content?.until) {
                newUntil = content?.until + 1;
            }
        }

        if (object.kind === 0) {
            profiles[object.pubkey] = object;
        }

        if (object.kind === 9735) {
            const event = await simpleZapFromEvent(
                object,
                state.mutiny_wallet!
            );

            // Only add it if it's a valid zap (not undefined)
            if (event) {
                zaps.push(event);
            }
        }
    }

    return {
        follows,
        zaps: [...zaps, ...(info?.value?.zaps || [])],
        profiles,
        until: newUntil ? newUntil : info?.value?.until
    };
};
