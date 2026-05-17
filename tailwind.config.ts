import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        surface: "#FFFFFF",
        border: "#E1E7EF",
        accent: "#1B3F8B",
        accentPale: "#EEF3FF",
        accentDark: "#0F2660",
        red: "#DC2626",
        green: "#059669",
        text: "#0F172A",
        muted: "#64748B",
        navy: "#0F172A",
      },
      fontFamily: {
        serif: ["var(--font-cormorant-garamond)", "serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
