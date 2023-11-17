import { createResource, createSignal, Match, Switch } from "solid-js";

import off from "~/assets/icons/download-channel.svg";
import on from "~/assets/icons/upload-channel.svg";
import { HackActivityType } from "~/components";
import { generateGradient } from "~/utils";

export function LabelCircle(props: {
    name?: string;
    image_url?: string;
    contact: boolean;
    label: boolean;
    channel?: HackActivityType;
    onError?: () => void;
}) {
    const [gradient] = createResource(async () => {
        if (props.name && props.contact) {
            return generateGradient(props.name || "?");
        } else {
            return undefined;
        }
    });

    const text = () =>
        props.contact && props.name && props.name.length
            ? props.name[0]
            : props.label
            ? "≡"
            : "?";
    const bg = () => (props.name && props.contact ? gradient() : "");

    const [errored, setErrored] = createSignal(false);

    return (
        <div
            class="flex h-[3rem] w-[3rem] flex-none items-center justify-center overflow-clip rounded-full border-b border-t border-b-white/10 border-t-white/50 bg-neutral-700 text-3xl uppercase"
            style={{
                background: props.image_url && !errored() ? "none" : bg()
            }}
        >
            <Switch>
                <Match when={errored()}>{text()}</Match>
                <Match when={props.image_url}>
                    <img
                        src={props.image_url}
                        alt={"image"}
                        onError={() => {
                            props.onError && props.onError();
                            setErrored(true);
                        }}
                    />
                </Match>
                <Match when={props.channel === "ChannelOpen"}>
                    <img src={on} alt="channel open" />
                </Match>
                <Match when={props.channel === "ChannelClose"}>
                    <img src={off} alt="channel close" />
                </Match>
                <Match when={true}>{text()}</Match>
            </Switch>
        </div>
    );
}
