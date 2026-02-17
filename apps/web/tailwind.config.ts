import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef2f7",
          100: "#d4e0ee",
          200: "#a9c1dd",
          300: "#7ea2cc",
          400: "#5383bb",
          500: "#2a64aa",
          600: "#1d4f8a",
          700: "#163b6a",
          800: "#0e2849",
          900: "#071428",
          950: "#030a14",
        },
        gold: {
          50: "#fdf8ec",
          100: "#fbf0d0",
          200: "#f7df9f",
          300: "#f2cc68",
          400: "#ecb730",
          500: "#d99f1a",
          600: "#b07d12",
          700: "#865e0d",
          800: "#5c4008",
          900: "#322204",
        },
        offwhite: "#f7f5f0",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-merriweather)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
