set dotenv-load := false

dev:
    pnpm run dev

local:
    pnpm link --global "@johncantrell97/mutiny-wasm"

remote:
    pnpm unlink "@johncantrell97/mutiny-wasm" && pnpm install

test:
    pnpm exec playwright test
    
test-ui:
    pnpm exec playwright test --ui
