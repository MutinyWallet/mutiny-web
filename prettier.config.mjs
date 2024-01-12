/** @type {import("prettier").Options} */
export default {
    trailingComma: "none",
    tabWidth: 4,
    semi: true,
    singleQuote: false,
    arrowParens: "always",
    printWidth: 80,
    useTabs: false,

    plugins: [
        "@ianvs/prettier-plugin-sort-imports",
        "prettier-plugin-tailwindcss" // MUST come last
    ],

    tailwindFunctions: ["classList"],

    importOrder: ["<THIRD_PARTY_MODULES>", "", "^[~/]", "", "^[./]"]
};
