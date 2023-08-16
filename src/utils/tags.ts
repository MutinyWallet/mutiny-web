import { TagItem } from "@mutinywallet/mutiny-wasm";

export type MutinyTagItem = {
    id: string;
    kind: "Label" | "Contact";
    name: string;
    last_used_time: bigint;
    npub?: string;
    ln_address?: string;
    lnurl?: string;
};

export const UNKNOWN_TAG: MutinyTagItem = {
    id: "Unknown",
    kind: "Label",
    name: "Unknown",
    last_used_time: 0n
};

export function tagsToIds(tags?: MutinyTagItem[]): string[] {
    if (!tags) {
        return [];
    }
    return tags.filter((tag) => tag.id !== "Unknown").map((tag) => tag.id);
}

export function tagToMutinyTag(tag: TagItem): MutinyTagItem {
    let kind: MutinyTagItem["kind"];

    switch (tag.kind) {
        case 0: {
            kind = "Label";
            break;
        }
        case 1:
        default: {
            kind = "Contact";
            break;
        }
    }

    return { ...tag, kind };
}

export function sortByLastUsed(a: MutinyTagItem, b: MutinyTagItem) {
    return Number(b.last_used_time - a.last_used_time);
}
