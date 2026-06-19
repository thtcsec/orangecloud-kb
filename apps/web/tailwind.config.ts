import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0a0a0b",
        surface: "#111113",
        "surface-elevated": "#18181b",
        border: "#27272a",
        muted: "#71717a",
        foreground: "#fafafa",
        accent: {
          DEFAULT: "#f97316",
          hover: "#fb923c",
          muted: "#7c2d12",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
