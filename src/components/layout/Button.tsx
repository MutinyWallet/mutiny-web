import { A } from "@solidjs/router";
import { JSX, ParentComponent, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { LoadingSpinner } from "~/components";

// Help from https://github.com/arpadgabor/credee/blob/main/packages/www/src/components/ui/button.tsx

type CommonButtonStyleProps = {
    intent?: "active" | "inactive" | "blue" | "red" | "green" | "text";
    layout?: "flex" | "pad" | "small" | "xs" | "full";
};

interface ButtonProps
    extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
        CommonButtonStyleProps {
    loading?: boolean;
    disabled?: boolean;
}

interface ButtonLinkProps
    extends JSX.ButtonHTMLAttributes<HTMLAnchorElement>,
        CommonButtonStyleProps {
    href: string;
    target?: string;
    rel?: string;
}

export const Button: ParentComponent<ButtonProps> = (props) => {
    const [local, attrs] = splitProps(props, ["children", "intent", "layout"]);
    return (
        <button
            {...attrs}
            disabled={props.disabled || props.loading}
            class="rounded-xl p-3 font-semibold transition disabled:bg-neutral-400/10 disabled:text-white/20 disabled:shadow-inner-button-disabled"
            classList={{
                "bg-white text-black": local.intent === "active",
                "bg-neutral-900 text-white":
                    !local.intent || local.intent === "inactive",
                "border border-white hover:text-[#3B6CCC]":
                    !local.intent || !!local.intent.match(/(active|inactive)/),
                "bg-m-blue hover:bg-m-blue-dark": local.intent === "blue",
                "bg-m-red hover:bg-m-red-dark": local.intent === "red",
                "bg-m-green hover:bg-m-green-dark": local.intent === "green",
                "text-white shadow-inner-button text-shadow-button":
                    local.intent && !!local.intent.match(/(blue|red|green)/),
                "": local.intent === "text",
                "flex-1 text-xl": !local.layout || local.layout === "flex",
                "px-8 text-xl": local.layout === "pad",
                "px-4 py-2 w-auto text-lg": local.layout === "small",
                "px-4 py-2 w-auto rounded-lg text-base": local.layout === "xs",
                "w-full text-xl": local.layout === "full"
            }}
        >
            <Show when={props.loading} fallback={local.children}>
                <div class="flex justify-center">
                    {/* TODO: constrain this to the exact height of the button */}
                    <LoadingSpinner wide />
                </div>
            </Show>
        </button>
    );
};

export const ButtonLink: ParentComponent<ButtonLinkProps> = (props) => {
    const [local, attrs] = splitProps(props, [
        "children",
        "intent",
        "layout",
        "href",
        "target",
        "rel"
    ]);
    return (
        <Dynamic
            {...attrs}
            component={local.href?.includes("://") ? "a" : A}
            href={local.href}
            target={local.target}
            rel={local.rel}
            class="flex justify-center rounded-xl p-3 font-semibold no-underline transition disabled:bg-neutral-400/10 disabled:text-white/20 disabled:shadow-inner-button-disabled"
            classList={{
                "bg-white text-black": local.intent === "active",
                "bg-transparent text-white":
                    !local.intent || local.intent === "inactive",
                "border border-white hover:text-[#3B6CCC]":
                    !local.intent || !!local.intent.match(/(active|inactive)/),
                "bg-m-blue hover:bg-m-blue-dark": local.intent === "blue",
                "bg-m-red hover:bg-m-red-dark": local.intent === "red",
                "bg-m-green hover:bg-m-green-dark": local.intent === "green",
                "text-white shadow-inner-button text-shadow-button":
                    local.intent && !!local.intent.match(/(blue|red|green)/),
                "": local.intent === "text",
                "flex-1 text-xl": !local.layout || local.layout === "flex",
                "px-8 text-xl": local.layout === "pad",
                "px-4 py-2 w-auto text-lg": local.layout === "small",
                "px-4 py-2 w-auto rounded-lg text-base": local.layout === "xs",
                "w-full text-xl": local.layout === "full"
            }}
        >
            {local.children}
        </Dynamic>
    );
};
