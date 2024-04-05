import { useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, onMount, Show } from "solid-js";

import {
    Button,
    InfoBox,
    NiceP,
    showToast,
    SimpleDialog,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { setSettings } from "~/logic/mutinyWalletSetup";
import { useMegaStore } from "~/state/megaStore";
import { bech32, bech32WordsToUrl, eify } from "~/utils";

const ImageWithFallback = (props: { src: string; alt: string }) => {
    const [hasError, setHasError] = createSignal(false);

    const handleError = () => {
        setHasError(true);
    };

    return (
        <img
            src={props.src}
            alt={props.alt}
            onError={handleError}
            class="h-4 w-4 rounded-sm"
            classList={{
                hidden: hasError()
            }}
        />
    );
};

export function HomePrompt() {
    const [state, _actions] = useMegaStore();
    const i18n = useI18n();

    const [params, setParams] = useSearchParams();

    // When we have a nice result we can head over to the send screen
    createEffect(() => {
        if (params.lnurlauth) {
            const lnurlauth = params.lnurlauth;
            setParams({ lnurlauth: undefined });
            setLnurlauthResult(lnurlauth);
            try {
                const decodedLnurl = bech32.decode(lnurlauth, 1023);
                const url = bech32WordsToUrl(decodedLnurl.words);
                const domain = new URL(url).hostname;
                setLnurlDomain(domain);
            } catch (e) {
                // We care about this error the domain is just to make it pretty
                console.error(e);
            }
            return;
        }
    });

    // LSPS stuff
    onMount(async () => {
        if (params.lsps) {
            const values = {
                lsp: "",
                lsps_connection_string: params.lsps,
                lsps_token: params.token
            };
            try {
                await state.mutiny_wallet?.change_lsp(
                    values.lsp ? values.lsp : undefined,
                    values.lsps_connection_string
                        ? values.lsps_connection_string
                        : undefined,
                    values.lsps_token ? values.lsps_token : undefined
                );
                await setSettings(values);
                setParams({ lsps: undefined, token: undefined });
                showToast({
                    title: "Success",
                    description: "LSPS settings changed"
                });
            } catch (e) {
                console.error("Error changing lsp:", e);
                showToast(eify(e));
            }
        }
    });

    // Lnurl Auth stuff
    const [lnurlauthResult, setLnurlauthResult] = createSignal<string>();
    const [authLoading, setAuthLoading] = createSignal<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = createSignal<boolean>(false);
    const [authError, setAuthError] = createSignal<Error | undefined>(
        undefined
    );
    const [lnurlDomain, setLnurlDomain] = createSignal<string>("");

    async function handleLnurlAuth() {
        setAuthLoading(true);
        try {
            await state.mutiny_wallet?.lnurl_auth(lnurlauthResult()!);
            setIsAuthenticated(true);
        } catch (e) {
            // lnurl1dp68gurn8ghj7um5v93kketj9ehx2amn9ashq6f0d3hxzat5dqlhgct884kx7emfdcnxkvfavvurwdtrvgmkyd3489skgcfexqckxd3svg6xgwr98q6nsd3c893kzcfkvc6nsdr9xpjxvc3jvejrxwpevyurqvfev3nxvvnxx5ergdc8g6gzl
            console.error(e);
            setAuthError(eify(e));
        } finally {
            setAuthLoading(false);
        }
    }

    return (
        <>
            <SimpleDialog
                title={i18n.t("modals.lnurl_auth.auth_request")}
                open={!!lnurlauthResult()}
                setOpen={(open) => {
                    if (!open) setLnurlauthResult(undefined);
                }}
            >
                <Show when={lnurlDomain()}>
                    <div class="flex w-full items-center justify-center gap-2 p-2">
                        <ImageWithFallback
                            src={`https://${lnurlDomain()}/favicon.ico`}
                            alt="Favicon"
                        />
                        <pre class="text-center">{lnurlDomain()}</pre>
                    </div>
                </Show>
                <Show when={!isAuthenticated()}>
                    <VStack>
                        <Button
                            loading={authLoading()}
                            intent="blue"
                            onClick={handleLnurlAuth}
                        >
                            {i18n.t("modals.lnurl_auth.login")}
                        </Button>
                        <Button
                            intent="red"
                            onClick={() => setLnurlauthResult(undefined)}
                        >
                            {i18n.t("modals.lnurl_auth.decline")}
                        </Button>
                    </VStack>
                </Show>
                <Show when={isAuthenticated()}>
                    <div class="flex flex-col items-center">
                        <div class="rounded bg-m-grey-950 px-2 py-1 text-center">
                            <NiceP>
                                {i18n.t("modals.lnurl_auth.authenticated")}
                            </NiceP>
                        </div>
                    </div>
                </Show>
                <Show when={authError()}>
                    <InfoBox accent="red">
                        {i18n.t("modals.lnurl_auth.error")}
                    </InfoBox>
                </Show>
            </SimpleDialog>
        </>
    );
}
