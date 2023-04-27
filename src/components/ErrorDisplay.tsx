import { Title } from "solid-start";
import { ButtonLink, DefaultMain, LargeHeader, SafeArea, SmallHeader } from "~/components/layout";

export default function ErrorDisplay(props: { error: Error }) {
    return (
        <SafeArea>
            <Title>Oh no!</Title>
            <DefaultMain>
                <LargeHeader>Error</LargeHeader>
                <SmallHeader>This never should've happened</SmallHeader>
                <p class="bg-white/10 rounded-xl p-4 font-mono">
                    <span class="font-bold">
                        {props.error.name}</span>: {props.error.message}
                </p>
                <div class="h-full" />
                <ButtonLink href="/" intent="red">Dangit</ButtonLink>
            </DefaultMain>
        </SafeArea>
    );
}
