import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: "#171916",
          50: "#323530",
          100: "#272a25",
          200: "#20231e",
          300: "#1b1d19",
          400: "#171916", // Primary dark bg
          500: "#131512",
          600: "#0f100e",
          700: "#0b0c0a",
        },
        ivory: {
          DEFAULT: "#F3F0E8",
          50: "#FFFFFF",
          100: "#FAF8F4",
          200: "#F3F0E8", // Light surface
          300: "#E6E1D4",
          400: "#D7D0C0",
          500: "#C2BAA6",
          600: "#9E9581",
        },
        olive: {
          DEFAULT: "#737B54",
          light: "#8A9367",
          dark: "#5A6140",
          surface: "rgba(115, 123, 84, 0.12)",
        },
        brass: {
          DEFAULT: "#B69A63",
          light: "#C7AD79",
          dark: "#997F4A",
          surface: "rgba(182, 154, 99, 0.12)",
        },
        brick: {
          DEFAULT: "#9E473D",
          light: "#B2564B",
          dark: "#7E342C",
          surface: "rgba(158, 71, 61, 0.12)",
        },
        // Semantic aliases wired to CSS variables
        bg: "var(--color-bg)",
        card: "var(--color-card)",
        "card-subtle": "var(--color-card-subtle)",
        border: "var(--color-border)",
        "border-subtle": "var(--color-border-subtle)",
        text: "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        "text-faint": "var(--color-text-faint)",
        accent: "var(--color-accent)",
        "accent-brass": "var(--color-accent-brass)",
        danger: "var(--color-danger)",
        warning: "var(--color-warning)",
        success: "var(--color-success)",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "Helvetica Neue", "sans-serif"],
      },
      letterSpacing: {
        editorial: "0.04em",
        caps: "0.08em",
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "4px",
        md: "4px",
        lg: "6px",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        raised: "0 4px 12px 0 rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
