import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        text: "var(--text)",
        muted: "var(--muted)",
        hint: "var(--hint)",
        accent: "var(--accent)",
        "accent-2": "var(--accent-2)",
        gold: "var(--gold)",
        danger: "var(--danger)",
        warning: "var(--warning)",
        success: "var(--success)",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        mono: ['"DM Mono"', "monospace"],
      },
      fontSize: {
        // Override default sizes to be mobile-friendly
        xs: "11px",
        sm: "12px",
        base: "14px",
        lg: "16px",
        xl: "18px",
        "2xl": "20px",
        "3xl": "24px",
        "4xl": "32px",
      },
      borderRadius: {
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        glow: "0 0 12px rgba(127, 255, 178, 0.5)",
        "glow-strong": "0 0 20px rgba(127, 255, 178, 0.7)",
      },
    },
  },
  plugins: [],
};

export default config;
