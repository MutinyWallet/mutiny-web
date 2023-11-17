import { createMemo, Match, Switch } from "solid-js";

import { StyledRadioGroup } from "~/components";
import { useMegaStore } from "~/state/megaStore";

type SendSource = "lightning" | "onchain";

export function MethodChooser(props: {
    source: SendSource;
    setSource: (source: string) => void;
    both?: boolean;
}) {
    const [store, _actions] = useMegaStore();

    const methods = createMemo(() => {
        const lnBalance =
            (store.balance?.lightning || 0n) +
            (store.balance?.federation || 0n);
        const onchainBalance =
            (store.balance?.confirmed || 0n) +
            (store.balance?.unconfirmed || 0n);
        return [
            {
                value: "lightning",
                label: "Lightning Balance",
                caption:
                    lnBalance > 0n
                        ? `${lnBalance.toLocaleString()} SATS`
                        : "No balance",
                disabled: lnBalance === 0n
            },
            {
                value: "onchain",
                label: "On-chain Balance",
                caption:
                    onchainBalance > 0n
                        ? `${onchainBalance.toLocaleString()} SATS`
                        : "No balance",
                disabled: onchainBalance === 0n
            }
        ];
    });
    return (
        <Switch>
            <Match when={props.both}>
                <StyledRadioGroup
                    accent="white"
                    initialValue={props.source}
                    onValueChange={props.setSource}
                    choices={methods()}
                />
            </Match>
            <Match when={props.source === "lightning"}>
                <StyledRadioGroup
                    accent="white"
                    initialValue={props.source}
                    onValueChange={props.setSource}
                    choices={[methods()[0]]}
                />
            </Match>
            <Match when={props.source === "onchain"}>
                <StyledRadioGroup
                    accent="white"
                    initialValue={props.source}
                    onValueChange={props.setSource}
                    choices={[methods()[1]]}
                />
            </Match>
        </Switch>
    );
}
