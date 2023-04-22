### Running Mutiny Web

```
pnpm install
pnpm run dev
```

### Local

To make local development easier with a latest local version of [the node manager](https://github.com/MutinyWallet/mutiny-node), you may want to `pnpm link` it.

Due to how [Vite's dev server works](https://vitejs.dev/config/server-options.html#server-fs-allow), the linked `mutiny-node` project folder should be a sibling of this `mutiny-web` folder. Alternatively you can change the allow path in `vite.config.ts`.

In your `mutiny-node` local repo:

```
just link
```

(on a Mac you might need to prefix `just link` with these flags: `AR=/opt/homebrew/opt/llvm/bin/llvm-ar CC=/opt/homebrew/opt/llvm/bin/clang`)

Now in this repo, link them.

```
just local
```

To revert back and use the remote version of mutiny-wasm:

```
just remote
```
