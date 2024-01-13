import { MutinyWallet } from "@mutinywallet/mutiny-wasm";

export type NostrTag = string[];
export declare enum NostrKind {
    Metadata = 0,
    Text = 1,
    RecommendRelay = 2,
    Contacts = 3,
    EncryptedDirectMessage = 4,
    EventDeletion = 5,
    Repost = 6,
    Reaction = 7,
    BadgeAward = 8,
    GenericRepost = 16,
    ChannelCreation = 40,
    ChannelMetadata = 41,
    ChannelMessage = 42,
    ChannelHideMessage = 43,
    ChannelMuteUser = 44,
    Report = 1984,
    ZapRequest = 9734,
    Zap = 9735,
    Highlight = 9802,
    MuteList = 10000,
    PinList = 10001,
    RelayList = 10002,
    ClientAuth = 22242,
    NostrConnect = 24133,
    CategorizedPeopleList = 30000,
    CategorizedBookmarkList = 30001,
    CategorizedRelayList = 30022,
    ProfileBadge = 30008,
    BadgeDefinition = 30009,
    MarketStall = 30017,
    MarketProduct = 30018,
    Article = 30023,
    AppSpecificData = 30078,
    Classified = 30402,
    AppRecommendation = 31989,
    AppHandler = 31990,
    CategorizedHighlightList = 39802,
    DVMJobFeedback = 65000,
    DVMJobResult = 65001,
    DVMJobRequestTranscription = 65002
}

export async function hexpubFromNpub(
    npub?: string
): Promise<string | undefined> {
    if (!npub) {
        return undefined;
    }
    if (!npub.toLowerCase().startsWith("npub")) {
        return undefined;
    }

    try {
        const hexpub = await MutinyWallet.npub_to_hexpub(npub);
        return hexpub;
    } catch (err) {
        console.error(err);
        return undefined;
    }
}

export function getPrimalImageUrl(image_url?: string): string | undefined {
    if (!image_url) {
        return undefined;
    }
    return `https://primal.b-cdn.net/media-cache?s=s&a=1&u=${encodeURIComponent(
        image_url
    )}`;
}
