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
        iocl: {
          saffron: "#F37021",
          "saffron-dark": "#D65A10",
          "saffron-light": "#FFF4ED",
          blue: "#1D3F8F",
          "blue-dark": "#142D69",
          "blue-light": "#EEF2FB",
        },
        fuel: {
          petrol: "#F37021",
          diesel: "#1D3F8F",
          xp95: "#C8102E",
          xtragreen: "#0E9AA7",
          lube: "#E0A100",
        },
        tender: {
          cash: "#1E9E5A",
          upi: "#6B4EFF",
          card: "#2B8CE6",
          credit: "#D6456B",
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
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        secondary: "var(--color-secondary)",
        danger: "var(--color-danger)",
        warning: "var(--color-warning)",
        success: "var(--color-success)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Plus Jakarta Sans", "sans-serif"],
        sans: ["var(--font-body)", "Inter", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        DEFAULT: "8px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "24px",
        full: "9999px",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)",
        card: "0 2px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.06)",
        raised: "0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
