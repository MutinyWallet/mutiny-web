### Running Mutiny Web

### Dependencies

-   pnpm > 8

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

Hopefully your editor picks up on the `prettier.config.mjs` file and auto formats accordingly. If you want to format everything in the project run `pnpm run format`.

### Deploying Web

Create a PR from `master` to `prod`, and once it does CI and gets approvals, do this from the command line:

```
git checkout master && git pull && git checkout prod && git pull && git merge --ff-only origin/master && git push
```

## Contributing

Before committing make sure to run `pnpm run pre-commit`. This will typecheck, lint, and format everything so CI won't hassle you. (Shortcut: `just pre`).

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

## Android

### How to test locally

```
just native
```

Now open up the `android` directory in android studio and run the build

### Deploying

#### Pull Requests

Each pull request will build the debug signet app and upload it internally to the github actions run.

#### Master

Each push to master will build a signed release version running in signet mode. The build process is almost identical to the release version.

Prereleased tags will be created for master.

#### Release

##### Android

First bump up the `versionCode` and `versionName` in `./andriod/app/build.gradle`. The `versionCode` must always go up by one when making a release. The `versionName` can mimic `package.json` with an extra build number like `0.4.3-1` to make it easier to keep things looking like they are in sync when android only releases go out.

Publish a new tag like `0.4.3-1` in order to trigger a signed release version running in mainnet mode.

##### iOS

In `ios/App/App.xcodeproj/project.pbxproj` bump `MARKETING_VERSION` and then do whatever needs to be done in testflight to get it released.

### Creating keys for the first time

1. Generate a new signing key

```
keytool -genkey -v -keystore <my-release-key.keystore> -alias <alias_name> -keyalg RSA -keysize 2048 -validity 10000
openssl base64 < <my-release-key.keystore> | tr -d '\n' | tee some_signing_key.jks.base64.txt
```

2. Create 3 Secret Key variables on your GitHub repository and fill in with the signing key information
    - `KEY_ALIAS` <- `<alias_name>`
    - `KEY_STORE_PASSWORD` <- `<your key store password>`
    - `SIGNING_KEY` <- the data from `<my-release-key.keystore>`
3. Change the `versionCode` and `versionName` on `app/build.gradle`
4. Commit and push.

## Translating

### Testing language keys

To check what keys are missing from your desired language:

```
just i18n $lang
```

### Adding new languages or keys

1. In `public/i18n/` locate your desired language .json file or create one if one does not exist

    - When creating a new language file ensure it follows the ISO 639 2-letter standard

2. Populate your translation file with a translation object where all of the keys will be located

If you want to add Japanese you will create a file `/public/i18n/jp.json` and populate it with keys like so:

```
{
  "common": {
        "continue": "続ける",
        ...
    }
}
```

(You should compare your translations against the English language as all other languages are not the master and are likely deprecated)

If you're using VS Code there are some nice extensions that can make this easier like i18n-ally and i18n-json-editor

3. Add your language to the `Language` object in `/src/utils/languages.ts`. This will allow you to select the language via the language selector in the UI. If your desired language is set as your primary language in your browser it will be selected automatically

```
export const LANGUAGE_OPTIONS: Language[] = [
    {
        value: "日本語",
        shortName: "jp"
    },
```

4. That's it! You should now be able to see your translation keys populating the app in your desired language. When youre ready go ahead and open a PR to have you language merged for others!
