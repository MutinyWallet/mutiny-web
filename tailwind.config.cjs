const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    safelist: [
        "grid-cols-1",
        "grid-cols-2",
        "gap-2",
        "gap-4",
        "outline-m-red",
        "outline-m-blue"
    ],
    variants: {
        extend: {
            borderWidth: ["responsive", "last", "hover", "focus"]
        }
    },
    theme: {
        extend: {
            colors: {
                "half-black": "rgba(0, 0, 0, 0.5)",
                "faint-white": "rgba(255, 255, 255, 0.1)",
                "light-text": "rgba(250, 245, 234, 0.5)",
                "m-green": "hsla(163, 70%, 38%, 1)",
                "m-green-dark": "hsla(163, 70%, 28%, 1)",
                "m-blue": "hsla(220, 59%, 52%, 1)",
                "m-blue-400": "hsla(219, 57%, 52%, 1)",
                "m-blue-dark": "hsla(220, 59%, 42%, 1)",
                "m-red": "hsla(343, 92%, 54%, 1)",
                "m-red-dark": "hsla(343, 92%, 44%, 1)",
                "m-yellow": "#E7D538",
                "sidebar-gray": "hsla(222, 15%, 7%, 1)",
                "m-grey-350": "hsla(0, 0%, 73%, 1)",
                "m-grey-400": "hsla(0, 0%, 64%, 1)",
                "m-grey-700": "hsla(0, 0%, 25%, 1)",
                "m-grey-750": "hsla(0, 0%, 17%, 1)",
                "m-grey-800": "hsla(0, 0%, 12%, 1)",
                "m-grey-900": "hsla(0, 0%, 9%, 1)",
                "m-grey-950": "hsla(0, 0%, 8%, 1)",
                "m-grey-975": "hsla(0, 0%, 5%, 1)"
            },
            backgroundImage: {
                "fade-to-blue":
                    "linear-gradient(1.63deg, #0B215B 32.05%, rgba(11, 33, 91, 0) 84.78%)",
                "subtle-fade":
                    "linear-gradient(180deg, #060A13 0%, #131E39 100%)",
                "richer-fade":
                    "linear-gradient(180deg, hsla(224, 20%, 8%, 1) 0%, hsla(224, 20%, 15%, 1) 100%)"
            },
            dropShadow: {
                "blue-glow": "0px 0px 32px rgba(11, 33, 91, 0.5)"
            },
            boxShadow: {
                "inner-button":
                    "1px 1px 2px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.1), inset -1px -1px 2px rgba(0, 0, 0, 0.2)",
                "inner-button-disabled":
                    "1px 1px 2px rgba(0, 0, 0, 0.05), inset 1px 1px 2px rgba(255, 255, 255, 0.05), inset -1px -1px 2px rgba(0, 0, 0, 0.1)",
                "fancy-card": "0px 4px 4px rgba(0, 0, 0, 0.1)",
                above: "0px -4px 10px rgba(0, 0, 0, 0.25)",
                keycap: "15px 15px 20px -5px rgba(0, 0, 0, 0.3)"
            },
            fontFamily: {
                "system-mono": ["ui-monospace", "Menlo", "Monaco", "monospace"]
            },
            textShadow: {
                button: "1px 1px 0px rgba(0, 0, 0, 0.4)"
            },
            animation: {
                throb: "throb 5s ease-in-out infinite"
            },
            keyframes: {
                throb: {
                    "0%, 100%": { transform: "scale(1)", opacity: 0.9 },
                    "50%": { transform: "scale(1.1)", opacity: 1 }
                }
            }
        }
    },
    plugins: [
        // default prefix is "ui"
        require("@kobalte/tailwindcss"),
        plugin(function ({ addUtilities }) {
            const newUtilities = {
                ".safe-top": {
                    paddingTop: "env(safe-area-inset-top)"
                },
                ".safe-left": {
                    paddingLeft: "env(safe-area-inset-left)"
                },
                ".safe-right": {
                    paddingRight: "env(safe-area-inset-right)"
                },
                ".safe-bottom": {
                    paddingBottom: "env(safe-area-inset-bottom)"
                },
                ".min-h-device": {
                    minHeight:
                        "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))"
                },
                ".h-device": {
                    height: "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))"
                },
                "max-h-device": {
                    maxHeight:
                        "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))"
                },
                ".h-svh": {
                    height: "calc(100svh - env(safe-area-inset-top) - env(safe-area-inset-bottom))"
                },
                ".disable-scrollbars": {
                    scrollbarWidth: "none",
                    "-ms-overflow-style": "none",
                    "&::-webkit-scrollbar": {
                        width: "0px",
                        background: "transparent",
                        display: "none"
                    },
                    "& *::-webkit-scrollbar": {
                        width: "0px",
                        background: "transparent",
                        display: "none"
                    },
                    "& *": {
                        scrollbarWidth: "none",
                        "-ms-overflow-style": "none"
                    }
                }
            };
            addUtilities(newUtilities);
        }),
        // Text shadow!
        plugin(function ({ matchUtilities, theme }) {
            matchUtilities(
                {
                    "text-shadow": (value) => ({
                        textShadow: value
                    })
                },
                { values: theme("textShadow") }
            );
        })
    ]
};
