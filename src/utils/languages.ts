export interface Language {
    value: string;
    label: string;
}

export const EN_OPTION: Language = {
    value: "English",
    label: "en"
};

export const LANGUAGE_OPTIONS: Language[] = [
    {
        value: "Português",
        label: "pt"
    },
    {
        value: "Korean",
        label: "ko"
    }
];
