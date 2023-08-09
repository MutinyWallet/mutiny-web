import type { StorybookConfig } from "storybook-solidjs-vite";

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
        "@storybook/addon-styling"
    ],
    framework: {
        name: "storybook-solidjs-vite",
        options: {}
    },
    docs: {
        autodocs: "tag"
    }
};
export default config;
