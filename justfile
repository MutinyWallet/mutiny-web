set dotenv-load := false

dev:
    pnpm run dev

pre:
    pnpm run pre-commit

i18n LANG:
    #!/usr/bin/env bash
    pnpm eslint-path "./src/i18n/{{LANG}}/translations.ts" --rule "{internal-rules/check-i18n-keys: warn}"

local:
    pnpm install && pnpm link --global "@mutinywallet/mutiny-wasm"

remote:
    pnpm unlink --filter "@mutinywallet/mutiny-wasm" && pnpm install

native:
    pnpm install && pnpm build && npx cap sync

test:
    pnpm exec playwright test
    
test-ui:
    pnpm exec playwright test --ui
