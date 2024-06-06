export interface Language {
    value: string;
    shortName: string;
}

export const EN_OPTION: Language = {
    value: "English",
    shortName: "en"
};

// Sorted alphabetically-ish
export const LANGUAGE_OPTIONS: Language[] = [
    {
        value: "Deutsch",
        shortName: "de"
    },
    {
        value: "Español",
        shortName: "es"
    },
    {
        value: "Français",
        shortName: "fr"
    },
    {
        value: "简体中文",
        shortName: "hans"
    },
    {
        value: "繁體中文",
        shortName: "hant"
    },
    {
        value: "Italian",
        shortName: "it"
    },
    {
        value: "한국어",
        shortName: "ko"
    },
    {
        value: "Português",
        shortName: "pt"
    }
];
