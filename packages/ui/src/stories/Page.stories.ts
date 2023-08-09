import type { Meta, StoryObj } from "storybook-solidjs";

import { Page } from "./Page";

const meta = {
    title: "Example/Page",
    component: Page,
    parameters: {
        // More on how to position stories at: https://storybook.js.org/docs/7.0/solid/configure/story-layout
        layout: "fullscreen"
    }
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {};
