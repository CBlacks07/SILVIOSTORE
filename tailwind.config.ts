import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03"
        },
        accent: {
          DEFAULT: "#f59e0b",
          dark:    "#d97706"
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
