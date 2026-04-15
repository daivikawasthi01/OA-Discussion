module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Obsidian Amber Design System */
        primary: {
          DEFAULT: "#ff9f4a",
          foreground: "#180800",
          container: "#fd8b00",
          dim: "#ed8200",
          fixed: "#fd8b00",
          "fixed-dim": "#ea8000",
        },
        secondary: {
          DEFAULT: "#ffa52a",
          container: "#875200",
          dim: "#ef981a",
          fixed: "#ffc78a",
          "fixed-dim": "#ffb55c",
        },
        tertiary: {
          DEFAULT: "#ffe393",
          container: "#ffd33a",
          fixed: "#ffd33a",
          dim: "#efc52b",
        },
        surface: {
          DEFAULT: "#0e0e0e",
          dim: "#0e0e0e",
          bright: "#2c2c2c",
          variant: "#262626",
          tint: "#ff9f4a",
          "container-lowest": "#000000",
          "container-low": "#131313",
          container: "#1a1919",
          "container-high": "#201f1f",
          "container-highest": "#262626",
        },
        "on-surface": {
          DEFAULT: "#ffffff",
          variant: "#adaaaa",
        },
        "on-primary": {
          DEFAULT: "#532a00",
          fixed: "#180800",
          container: "#442100",
          "fixed-variant": "#512800",
        },
        "on-secondary": {
          DEFAULT: "#512f00",
          fixed: "#4d2d00",
          container: "#fff6f0",
          "fixed-variant": "#744600",
        },
        "on-tertiary": {
          DEFAULT: "#665100",
          fixed: "#453600",
          container: "#5c4900",
          "fixed-variant": "#675200",
        },
        outline: {
          DEFAULT: "#767575",
          variant: "#484847",
        },
        error: {
          DEFAULT: "#ff7351",
          container: "#b92902",
          dim: "#d53d18",
        },
        "on-error": {
          DEFAULT: "#450900",
          container: "#ffd2c8",
        },
        inverse: {
          surface: "#fcf9f8",
          "on-surface": "#565555",
          primary: "#914d00",
        },
        background: "#0e0e0e",
        "on-background": "#ffffff",
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Manrope", "sans-serif"],
        label: ["Manrope", "sans-serif"],
        manrope: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.75rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
