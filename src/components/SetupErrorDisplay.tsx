import { Title } from "solid-start";
import {
    DefaultMain,
    LargeHeader,
    NiceP,
    SafeArea,
    SmallHeader
} from "~/components/layout";
import { ExternalLink } from "./layout/ExternalLink";
import { Match, Switch } from "solid-js";
import { ImportExport } from "./ImportExport";
import { Logs } from "./Logs";
import { DeleteEverything } from "./DeleteEverything";
import { FeedbackLink } from "~/routes/Feedback";

function ErrorFooter() {
    return (
        <>
            <div class="h-full" />
            <div class="self-center mt-4">
                <FeedbackLink setupError={true} />
            </div>
        </>
    );
}

export default function SetupErrorDisplay(props: { initialError: Error }) {
    // Error shouldn't be reactive, so we assign to it so it just gets rendered with the first value
    const error = props.initialError;

    return (
        <SafeArea>
            <Switch>
                <Match when={error.message.startsWith("Existing tab")}>
                    <Title>Multiple tabs detected</Title>
                    <DefaultMain>
                        <LargeHeader>Multiple tabs detected</LargeHeader>
                        <p class="bg-white/10 rounded-xl p-4 font-mono">
                            <span class="font-bold">{error.name}</span>:{" "}
                            {error.message}
                        </p>
                        <NiceP>
                            Mutiny currently only supports use in one tab at a
                            time. It looks like you have another tab open with
                            Mutiny running. Please close that tab and refresh
                            this page, or close this tab and refresh the other
                            one.
                        </NiceP>
                        <ErrorFooter />
                    </DefaultMain>
                </Match>
                <Match when={error.message.startsWith("Browser error")}>
                    <Title>Incompatible browser</Title>
                    <DefaultMain>
                        <LargeHeader>Incompatible browser detected</LargeHeader>
                        <p class="bg-white/10 rounded-xl p-4 font-mono">
                            <span class="font-bold">{error.name}</span>:{" "}
                            {error.message}
                        </p>
                        <NiceP>
                            Mutiny requires a modern browser that supports
                            WebAssembly, LocalStorage, and IndexedDB. Some
                            browsers disable these features in private mode.
                        </NiceP>
                        <NiceP>
                            Please make sure your browser supports all these
                            features, or consider trying another browser. You
                            might also try disabling certain extensions or
                            "shields" that block these features.
                        </NiceP>
                        <NiceP>
                            (We'd love to support more private browsers, but we
                            have to save your wallet data to browser storage or
                            else you will lose funds.)
                        </NiceP>
                        <ExternalLink href="https://github.com/MutinyWallet/mutiny-web/wiki/Browser-Compatibility">
                            Supported Browsers
                        </ExternalLink>

                        <ErrorFooter />
                    </DefaultMain>
                </Match>
                <Match when={true}>
                    <Title>Failed to load</Title>
                    <DefaultMain>
                        <LargeHeader>Failed to load Mutiny</LargeHeader>
                        <p class="bg-white/10 rounded-xl p-4 font-mono">
                            <span class="font-bold">{error.name}</span>:{" "}
                            {error.message}
                        </p>
                        <NiceP>
                            Something went wrong while booting up Mutiny Wallet.
                        </NiceP>
                        <NiceP>
                            If your wallet seems broken, here are some tools to
                            try to debug and repair it.
                        </NiceP>
                        <NiceP>
                            If you have any questions on what these buttons do,
                            please{" "}
                            <ExternalLink href="https://matrix.to/#/#mutiny-community:lightninghackers.com">
                                reach out to us for support.
                            </ExternalLink>
                        </NiceP>
                        <ImportExport emergency />
                        <Logs />
                        <div class="rounded-xl p-4 flex flex-col gap-2 bg-m-red">
                            <SmallHeader>Danger zone</SmallHeader>
                            <DeleteEverything emergency />
                        </div>

                        <ErrorFooter />
                    </DefaultMain>
                </Match>
            </Switch>
        </SafeArea>
    );
}
