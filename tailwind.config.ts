import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        canvas: {
          night: "#000000",
          "night-elevated": "#0a0a0a",
          light: "#ffffff",
          cream: "#fbfbf5",
        },
        surface: {
          "elevated-dark": "#1e2c31",
          dark: "#12181b",
          light: "#f4f4ee",
        },
        brand: {
          aloe: "#c1fbd4",
          pistachio: "#d4f9e0",
          mint: "#99b3ad",
          dark: "#0b1416",
        },
        shade: {
          30: "#d4d4d8",
          40: "#a1a1aa",
          50: "#71717a",
          60: "#52525b",
          70: "#3f3f46",
        },
        hairline: {
          light: "#e4e4e7",
          dark: "#1e2c31",
          subtle: "rgba(255,255,255,0.08)",
        },
        ink: "#000000",
        "on-primary": "#ffffff",
        "link-cool": {
          1: "#9dabad",
          2: "#9797a2",
          3: "#bdbdca",
          mint: "#99b3ad",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Helvetica", "Arial", "sans-serif"],
        display: ["var(--font-neue)", "NeueHaasGrotesk Display", "Helvetica Neue", "Arial", "sans-serif"],
      },
      borderRadius: {
        pill: "9999px",
        card: "16px",
      },
      boxShadow: {
        elevated: "0 10px 30px -10px rgba(0,0,0,0.3)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        card: "0 2px 12px rgba(0, 0, 0, 0.04)",
        paper: "0 8px 8px rgba(0,0,0,0.04), 0 4px 4px rgba(0,0,0,0.03), 0 2px 2px rgba(0,0,0,0.02), 0 0 0 1px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
