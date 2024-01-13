import { MutinyWallet } from "@mutinywallet/mutiny-wasm";
import { ResourceFetcher } from "solid-js";

import { useMegaStore } from "~/state/megaStore";
import {
    getPrimalImageUrl,
    hexpubFromNpub,
    NostrKind,
    NostrTag
} from "~/utils/nostr";

type NostrEvent = {
    created_at: number;
    content: string;
    tags: NostrTag[];
    kind?: NostrKind | number;
    pubkey: string;
    id?: string;
    sig?: string;
};

type SimpleZapItem = {
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

function getZapKind(event: NostrEvent): "public" | "private" | "anonymous" {
    const anonTag = event.tags.find((t) => {
        if (t[0] === "anon") {
            return true;
        }
    });

    // If the anon field is empty it's anon, if it has other elements its private, otherwise it's public
    if (anonTag) {
        return anonTag.length < 2 ? "anonymous" : "private";
    }

    return "public";
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
            kind: getZapKind(request),
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

// todo remove
const PRIMAL_API = import.meta.env.VITE_PRIMAL;

type PrimalResponse = NostrEvent | NostrProfile;

async function fetchZapsFromPrimal(
    follows: string[],
    primal_url?: string,
    until?: number
): Promise<PrimalResponse[]> {
    if (!primal_url) throw new Error("Missing PRIMAL_API environment variable");

    const query = {
        kinds: [9735, 0, 10000113],
        limit: 100,
        pubkeys: follows
    };

    const restPayload = JSON.stringify([
        "zaps_feed",
        // If we have a until value, use it, otherwise don't include it
        until ? { ...query, since: until } : query
    ]);

    const response = await fetch(primal_url, {
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

    // A primal response could be an error ({error: "error"}, or an array of events
    if (data.error || !Array.isArray(data)) {
        throw new Error("Zap response was not an array");
    }

    return data;
}

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

    try {
        console.log("fetching zaps for:", npub);
        let follows: string[] = info?.value ? info.value.follows : [];
        const zaps: SimpleZapItem[] = [];
        const profiles: Record<string, NostrProfile> =
            info.value?.profiles || {};
        let newUntil = undefined;

        const primal_url = state.settings?.primal_api;
        if (!primal_url)
            throw new Error("Missing PRIMAL_API environment variable");

        // Only have to ask the relays for follows one time
        if (follows.length === 0) {
            const contacts = await state.mutiny_wallet?.get_contacts_sorted();
            const hexpubs = [];
            for (const contact of contacts) {
                if (contact.npub) {
                    const hexpub = await hexpubFromNpub(contact.npub);
                    if (hexpub) {
                        hexpubs.push(hexpub);
                    }
                }
            }
            follows = hexpubs;
        }

        // Ask primal for all the zaps for these follow pubkeys
        const data = await fetchZapsFromPrimal(
            follows,
            primal_url,
            info?.value?.until
        );

        // Parse the primal response
        for (const object of data) {
            if (object.kind === 10000113) {
                // console.log("got a 10000113 object", object);
                try {
                    const content = JSON.parse(object.content);
                    if (content?.until) {
                        newUntil = content?.until + 1;
                    }
                } catch (e) {
                    console.error("Failed to parse content: ", object.content);
                }
            }

            if (object.kind === 0) {
                // console.log("got a 0 object", object);
                profiles[object.pubkey] = object as NostrProfile;
            }

            if (object.kind === 9735) {
                // console.log("got a 9735 object", object);
                try {
                    const event = await simpleZapFromEvent(
                        object,
                        state.mutiny_wallet!
                    );

                    // Only add it if it's a valid zap (not undefined)
                    if (event) {
                        zaps.push(event);
                    }
                } catch (e) {
                    console.error("Failed to parse zap event: ", object, e);
                }
            }
        }

        return {
            follows,
            zaps: [...zaps, ...(info?.value?.zaps || [])],
            profiles,
            until: newUntil ? newUntil : info?.value?.until
        };
    } catch (e) {
        console.error("Failed to load zaps: ", e);
        throw new Error("Failed to load zaps");
    }
};

export const fetchNostrProfile: ResourceFetcher<
    string,
    NostrProfile | undefined
> = async (hexpub, _info) => {
    return await actuallyFetchNostrProfile(hexpub);
};

export async function actuallyFetchNostrProfile(hexpub: string) {
    try {
        if (!PRIMAL_API)
            throw new Error("Missing PRIMAL_API environment variable");

        const response = await fetch(PRIMAL_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(["user_profile", { pubkey: hexpub }])
        });

        if (!response.ok) {
            throw new Error(`Failed to load profile`);
        }

        const data = await response.json();

        for (const object of data) {
            if (object.kind === 0) {
                return object as NostrProfile;
            }
        }
    } catch (e) {
        console.error("Failed to load profile: ", e);
        throw new Error("Failed to load profile");
    }
}

// Search results from primal have some of the stuff we want for a TagItem contact
export type PseudoContact = {
    name: string;
    hexpub: string;
    ln_address?: string;
    lnurl?: string;
    image_url?: string;
    primal_image_url?: string;
};

export async function searchProfiles(query: string): Promise<PseudoContact[]> {
    console.log("searching profiles...");
    const response = await fetch(PRIMAL_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify([
            "user_search",
            { query: query.trim(), limit: 10 }
        ])
    });

    if (!response.ok) {
        throw new Error(`Failed to search`);
    }

    const data = await response.json();

    const users: PseudoContact[] = [];

    for (const object of data) {
        if (object.kind === 0) {
            try {
                const profile = object as NostrProfile;
                const contact = profileToPseudoContact(profile);
                users.push(contact);
            } catch (e) {
                console.error("Failed to parse content: ", object.content);
            }
        }
    }

    return users;
}

export function profileToPseudoContact(profile: NostrProfile): PseudoContact {
    const content = JSON.parse(profile.content);
    const contact: Partial<PseudoContact> = {
        hexpub: profile.pubkey
    };
    contact.name = content.display_name || content.name || profile.pubkey;
    contact.ln_address = content.lud16 || undefined;
    contact.lnurl = content.lud06 || undefined;
    contact.image_url = content.image || content.picture || undefined;
    contact.primal_image_url = getPrimalImageUrl(contact.image_url);

    return contact as PseudoContact;
}
