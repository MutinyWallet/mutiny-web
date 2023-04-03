import { cva, VariantProps } from "class-variance-authority";
import { children, JSX, ParentComponent, splitProps } from "solid-js";

const button = cva(["p-4", "rounded-xl", "text-xl", "font-semibold"], {
    variants: {
        intent: {
            active: "bg-white text-black",
            inactive: "bg-black text-white border border-white",
            blue: "bg-[#3B6CCC] text-white",
            red: "bg-[#F61D5B] text-white"
        },
        layout: {
            flex: "flex-1",
            pad: "px-8"
        },
    },

    defaultVariants: {
        intent: "inactive",
        layout: "flex"
    },
});


// Help from https://github.com/arpadgabor/credee/blob/main/packages/www/src/components/ui/button.tsx

type StyleProps = VariantProps<typeof button>
interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement>, StyleProps { }

export const Button: ParentComponent<ButtonProps> = props => {
    const slot = children(() => props.children)
    const [local, attrs] = splitProps(props, ['children', 'intent', 'layout', 'class'])

    return (
        <button
            {...attrs}
            class={button({
                class: local.class || "",
                intent: local.intent,
                layout: local.layout,
            })}
        >
            {slot()}
        </button>
    )
}