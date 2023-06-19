import { cva, VariantProps } from "class-variance-authority";
import { children, JSX, ParentComponent, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { A } from "solid-start";
import { LoadingSpinner } from ".";

const button = cva(
    "p-3 rounded-xl font-semibold transition disabled:bg-neutral-400/10 disabled:text-white/20 disabled:shadow-inner-button-disabled",
    {
        variants: {
            // TODO: button hover has to work different than buttonlinks (like disabled state)
            intent: {
                active: "bg-white text-black border border-white hover:text-[#3B6CCC]",
                inactive:
                    "bg-transparent text-white border border-white hover:text-[#3B6CCC]",
                glowy: "bg-black/10 shadow-xl text-white border border-m-blue hover:m-blue-dark hover:text-m-blue",
                blue: "bg-m-blue text-white shadow-inner-button hover:bg-m-blue-dark text-shadow-button",
                red: "bg-m-red text-white shadow-inner-button hover:bg-m-red-dark text-shadow-button",
                green: "bg-m-green text-white shadow-inner-button hover:bg-m-green-dark text-shadow-button",
                text: ""
            },
            layout: {
                flex: "flex-1 text-xl",
                pad: "px-8 text-xl",
                small: "px-4 py-2 w-auto text-lg",
                xs: "px-4 py-2 w-auto rounded-lg text-base",
                full: "w-full text-xl"
            }
        },
        defaultVariants: {
            intent: "inactive",
            layout: "flex"
        }
    }
);

// Help from https://github.com/arpadgabor/credee/blob/main/packages/www/src/components/ui/button.tsx

type StyleProps = VariantProps<typeof button>;
interface ButtonProps
    extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
        StyleProps {
    loading?: boolean;
    disabled?: boolean;
}

export const Button: ParentComponent<ButtonProps> = (props) => {
    const slot = children(() => props.children);
    const [local, attrs] = splitProps(props, [
        "children",
        "intent",
        "layout",
        "class"
    ]);

    return (
        <button
            {...attrs}
            disabled={props.disabled || props.loading}
            class={button({
                class: local.class || "",
                intent: local.intent,
                layout: local.layout
            })}
        >
            <Show when={props.loading} fallback={slot()}>
                <div class="flex justify-center">
                    {/* TODO: constrain this to the exact height of the button */}
                    <LoadingSpinner wide />
                </div>
            </Show>
        </button>
    );
};

interface ButtonLinkProps
    extends JSX.ButtonHTMLAttributes<HTMLAnchorElement>,
        StyleProps {
    href: string;
    target?: string;
    rel?: string;
}

export const ButtonLink: ParentComponent<ButtonLinkProps> = (props) => {
    const slot = children(() => props.children);
    const [local, attrs] = splitProps(props, [
        "children",
        "intent",
        "layout",
        "class",
        "href",
        "target",
        "rel"
    ]);

    return (
        <Dynamic
            component={local.href?.includes("://") ? "a" : A}
            href={local.href}
            target={local.target}
            rel={local.rel}
            {...attrs}
            class={button({
                class: `flex justify-center no-underline ${local.class || ""}`,
                intent: local.intent,
                layout: local.layout
            })}
        >
            {slot()}
        </Dynamic>
    );
};
