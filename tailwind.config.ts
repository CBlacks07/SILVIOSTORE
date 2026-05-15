import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fcf9f2",
          100: "#f7f0e2",
          200: "#ebdcb9",
          300: "#dec48d",
          400: "#d1a861",
          500: "#c5903b",
          600: "#a3752c",
          700: "#825c23",
          800: "#61491e",
          900: "#4f3c1a",
          950: "#1a1612" // Très sombre brun chocolaté/bronze
        },
        accent: {
          DEFAULT: "#d1a861", // Gold
          dark:    "#a3752c"  // Bronze
        }
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "Roboto", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        subtitle: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        button: ["Georgia", "\"Times New Roman\"", "serif"]
      },
      container: {
        center: true,
        padding: { DEFAULT: "1rem", lg: "2rem" }
      },
      animation: {
        marquee: "marquee 25s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    }
  },
  plugins: []
};

export default config;
