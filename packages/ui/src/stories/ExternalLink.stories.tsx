import type { Meta, StoryObj } from "storybook-solidjs";

import { ExternalLink } from "../components/ExternalLink";

// More on how to set up stories at: https://storybook.js.org/docs/7.0/solid/writing-stories/introduction
const meta = {
    title: "External Link",
    component: ExternalLink,
    tags: ["autodocs"],
    argTypes: {
        href: {
            description: "Hyperlink",
            control: "text"
        },
        children: {
            description: "Link text",
            control: "text"
        }
    }
} satisfies Meta<typeof ExternalLink>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/solid/writing-stories/args
export const MutinyWallet: Story = {
    args: {
        children: <>Mutiny Wallet</>,
        href: "https://app.mutinywallet.com"
    }
};

export const EmptyChildren: Story = {
    args: {
        href: "https://app.mutinywallet.com"
    }
};
