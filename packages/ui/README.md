# ui

A solid-js ui component package and storybook for quick component development

## Building

Using npm:

```bash
$ pnpm run build
```

## Running Storybook

```bash
$ pnpm run storybook
```

## Importing styles

### Root css

```js
// your-project/src/root.tsx
import "@mutinywallet/ui/style.css"
```

### Tailwind config

```js
// your-project/src/tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [
        require('@mutinywallet/ui/tailwind.config.cjs')
    ]
};
```