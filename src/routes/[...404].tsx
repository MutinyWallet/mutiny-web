import { Title } from "solid-start";
import { HttpStatusCode } from "solid-start/server";
import { ButtonLink, DefaultMain, LargeHeader, SafeArea } from "~/components/layout";

export default function NotFound() {
  return (
    <SafeArea>

      <Title>Not Found</Title>
      <HttpStatusCode code={404} />
      <DefaultMain>
        <LargeHeader>Not Found</LargeHeader>
        <p>
          This is probably Paul's fault.
        </p>
        <div class="h-full" />
        <ButtonLink href="/" intent="red">Dangit</ButtonLink>
      </DefaultMain>
    </SafeArea>
  );
}
