import type { Meta, StoryObj } from "storybook-solidjs";

import { LoadingSpinner } from "../components/LoadingSpinner";

// More on how to set up stories at: https://storybook.js.org/docs/7.0/solid/writing-stories/introduction
const meta = {
    title: "Loading Spinner",
    component: LoadingSpinner,
    tags: ["autodocs"],
    argTypes: {
        big: {
            description: "Height fill",
            control: "boolean"
        },
        wide: {
            description: "Justify center",
            control: "boolean"
        }
    }
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/solid/writing-stories/args
export const Default: Story = {
    args: {}
};

export const Big: Story = {
    args: {
        big: true
    }
};

export const Wide: Story = {
    args: {
        wide: true
    }
};
