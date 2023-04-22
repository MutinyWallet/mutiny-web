set dotenv-load := false

dev:
    pnpm run dev

local:
    pnpm link --global "@mutinywallet/mutiny-wasm"

remote:
    pnpm unlink "@mutinywallet/mutiny-wasm" && pnpm install
