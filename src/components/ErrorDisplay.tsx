import { A, Title } from "solid-start";
import {
    Button,
    DefaultMain,
    LargeHeader,
    NiceP,
    SafeArea,
    SmallHeader
} from "~/components/layout";
import { ExternalLink } from "./layout/ExternalLink";

export default function ErrorDisplay(props: { error: Error }) {
    return (
        <SafeArea>
            <Title>Oh no!</Title>
            <DefaultMain>
                <LargeHeader>Error</LargeHeader>
                <SmallHeader>This never should've happened</SmallHeader>
                <p class="bg-white/10 rounded-xl p-4 font-mono">
                    <span class="font-bold">{props.error.name}</span>:{" "}
                    {props.error.message}
                </p>
                <NiceP>
                    Try reloading this page or clicking the "Dangit" button. If
                    you keep having problems,{" "}
                    <ExternalLink href="https://matrix.to/#/#mutiny-community:lightninghackers.com">
                        reach out to us for support.
                    </ExternalLink>
                </NiceP>
                <NiceP>
                    Getting desperate? Try the{" "}
                    <A href="/emergencykit">emergency kit.</A>
                </NiceP>
                <div class="h-full" />
                <Button
                    onClick={() => (window.location.href = "/")}
                    intent="red"
                >
                    Dangit
                </Button>
            </DefaultMain>
        </SafeArea>
    );
}
