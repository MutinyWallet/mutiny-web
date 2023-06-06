import { Title } from "solid-start";
import { DefaultMain, LargeHeader, NiceP, SafeArea } from "~/components/layout";
import { ExternalLink } from "./layout/ExternalLink";

export default function SetupErrorDisplay(props: { error: Error }) {
    return (
        <SafeArea>
            <Title>Incompatible browser</Title>
            <DefaultMain>
                <LargeHeader>Incompatible browser detected</LargeHeader>
                <p class="bg-white/10 rounded-xl p-4 font-mono">
                    <span class="font-bold">{props.error.name}</span>:{" "}
                    {props.error.message}
                </p>
                <NiceP>
                    Mutiny requires a modern browser that supports WebAssembly,
                    LocalStorage, and IndexedDB. Some browsers disable these
                    features in private mode.
                </NiceP>
                <NiceP>
                    Please make sure your browser supports all these features,
                    or consider trying another browser. You might also try
                    disabling certain extensions or "shields" that block these
                    features.
                </NiceP>
                <NiceP>
                    (We'd love to support more private browsers, but we have to
                    save your wallet data to browser storage or else you will
                    lose funds.)
                </NiceP>
                <ExternalLink href="https://github.com/MutinyWallet/mutiny-web/wiki/Browser-Compatibility">
                    Supported Browsers
                </ExternalLink>

                <div class="h-full" />
                <p class="self-center text-neutral-500 mt-4">
                    Bugs? Feedback?{" "}
                    <span class="text-neutral-400">
                        <ExternalLink href="https://github.com/MutinyWallet/mutiny-web/issues">
                            Create an issue
                        </ExternalLink>
                    </span>
                </p>
            </DefaultMain>
        </SafeArea>
    );
}
