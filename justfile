set dotenv-load := false

dev:
    pnpm run dev

local:
    pnpm link --global "@mutinywallet/mutiny-wasm"

remote:
    pnpm unlink --filter "@mutinywallet/mutiny-wasm" && pnpm install

test:
    pnpm exec playwright test
    
test-ui:
    pnpm exec playwright test --ui
