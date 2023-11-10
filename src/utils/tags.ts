import { TagItem } from "@mutinywallet/mutiny-wasm";

export function tagsToIds(tags?: TagItem[]): string[] {
    if (!tags) {
        return [];
    }
    return tags.filter((tag) => tag.id !== "Unknown").map((tag) => tag.id);
}

export function sortByLastUsed(a: TagItem, b: TagItem) {
    return Number(b.last_used_time - a.last_used_time);
}
