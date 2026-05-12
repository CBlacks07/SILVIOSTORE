import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f5f7fa",
          100: "#e4e9f0",
          200: "#c8d2e0",
          300: "#9fb0c8",
          400: "#6f87aa",
          500: "#4d6890",
          600: "#3b5377",
          700: "#314361",
          800: "#2b3a52",
          900: "#1f2a3c",
          950: "#121826"
        },
        accent: {
          DEFAULT: "#d97706",
          dark:    "#b45309"
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
