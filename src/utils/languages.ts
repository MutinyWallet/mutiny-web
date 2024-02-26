export interface Language {
    value: string;
    shortName: string;
}

export const EN_OPTION: Language = {
    value: "English",
    shortName: "en"
};

export const LANGUAGE_OPTIONS: Language[] = [
    {
        value: "Español",
        shortName: "es"
    },
    {
        value: "Português",
        shortName: "pt"
    },
    {
        value: "한국어",
        shortName: "ko"
    }
];
