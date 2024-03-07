module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:solid/typescript",
        "plugin:import/typescript",
        "plugin:import/recommended"
    ],
    overrides: [
        {
            files: ["**/*.cjs"], // Specify the file pattern for CJS files
            parserOptions: {
                sourceType: "script" // Treat the CJS files as CommonJS modules
            },
            rules: {
                "@typescript-eslint/no-var-requires": "off" // Disable this specific rule for CJS files
            }
        }
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: "./",
        project: "tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
            jsx: true
        }
    },
    plugins: ["@typescript-eslint", "solid", "import"],
    rules: {
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",
                destructuredArrayIgnorePattern: "^_",
                varsIgnorePattern: "^_"
            }
        ],
        "solid/reactivity": "warn",
        "solid/no-destructure": "warn",
        "solid/jsx-no-undef": "error",
        "@typescript-eslint/no-non-null-assertion": "off"
    },
    settings: {
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"]
        },
        "import/resolver": {
            typescript: {
                project: ["./tsconfig.json"],
                alwaysTryTypes: true
            }
        }
    }
};
