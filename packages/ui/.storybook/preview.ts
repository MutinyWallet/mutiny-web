import '../src/index.css'
import { Preview } from "storybook-solidjs"

const preview: Preview = {
    parameters: {
        backgrounds: {
            default: 'dark',
            values: [
                {
                    name: 'dark',
                    value: '#171717',
                },
                {
                    name: 'light',
                    value: '#3b5998',
                },
            ],
        },
        actions: { argTypesRegex: "^on[A-Z].*" },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/
            }
        }
    }
};

export default preview;
