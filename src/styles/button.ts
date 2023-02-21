import { cva } from "class-variance-authority";

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

export default button