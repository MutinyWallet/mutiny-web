### Running Mutiny Web

### Dependencies

- pnpm > 8

```
pnpm install
pnpm run dev
```

### Env

The easiest way to get start with development is to create a file called `.env.local` and copy the contents of `.env.example` into it. This is basically identical to the env that `signet-app.mutinywallet.com` uses.

### Testing

We have a couple Playwright e2e tests in the e2e folder. You can run these with:

```
just test
```

Or get a visual look into what's happening:

```
just test-ui
```

### Formatting

Hopefully your editor picks up on the `.prettirrc` file and auto formats accordingly. If you want to format everything in the project run `pnpm run format`.

### Local

If you want to develop against a local version of [the node manager](https://github.com/MutinyWallet/mutiny-node), you may want to `pnpm link` it.

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
