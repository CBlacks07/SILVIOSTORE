import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#fbf8fb",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f6f3f5",
        secondary: "#605e5a",
        "on-primary-container": "#7a83a0",
        "primary-fixed-dim": "#bdc6e5",
        "on-tertiary-fixed": "#2d1603",
        "surface-container": "#f0edef",
        "on-tertiary-container": "#a27c60",
        "primary-container": "#111b32",
        error: "#ba1a1a",
        "tertiary-container": "#2d1603",
        "surface-variant": "#e4e2e4",
        "surface-tint": "#555e79",
        "primary-fixed": "#dae2ff",
        "secondary-fixed-dim": "#c9c6c0",
        "on-background": "#1b1b1d",
        "inverse-surface": "#303032",
        "tertiary-fixed": "#ffdcc4",
        "on-primary": "#ffffff",
        "on-tertiary-fixed-variant": "#5f4028",
        "outline-variant": "#c6c6ce",
        "on-secondary-container": "#666460",
        "surface-container-highest": "#e4e2e4",
        "surface-bright": "#fbf8fb",
        outline: "#76777e",
        "surface-container-high": "#eae7ea",
        primary: "#000000",
        "on-primary-fixed": "#111b32",
        "on-error": "#ffffff",
        "on-primary-fixed-variant": "#3d4660",
        "on-surface": "#1b1b1d",
        "on-secondary-fixed-variant": "#484743",
        "surface-dim": "#dcd9dc",
        "secondary-container": "#e6e2dc",
        tertiary: "#000000",
        "inverse-primary": "#bdc6e5",
        "tertiary-fixed-dim": "#eabe9e",
        "on-error-container": "#93000a",
        "error-container": "#ffdad6",
        "on-secondary-fixed": "#1c1c18",
        "on-secondary": "#ffffff",
        "on-tertiary": "#ffffff",
        "inverse-on-surface": "#f3f0f2",
        "secondary-fixed": "#e6e2dc",
        "on-surface-variant": "#45464d",
        background: "#fbf8fb",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        xxl: "2rem",
        full: "9999px"
      },
      spacing: {
        "stack-sm": "8px",
        "margin-desktop": "80px",
        "stack-xl": "120px",
        "stack-lg": "64px",
        gutter: "32px",
        "margin-mobile": "20px",
        "container-max": "1440px",
        "stack-md": "24px",
        "margin-tablet": "40px"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        subtitle: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        button: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        "display-hero-mobile": ["Playfair Display"],
        "headline-lg-mobile": ["Playfair Display"],
        "headline-lg": ["Playfair Display"],
        "headline-md": ["Playfair Display"],
        "body-md": ["Inter"],
        "display-hero": ["Playfair Display"],
        "label-caps": ["Inter"],
        "body-lg": ["Inter"]
      },
      fontSize: {
        "display-hero-mobile": ["48px", { lineHeight: "54px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-lg-mobile": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "headline-lg": ["48px", { lineHeight: "56px", fontWeight: "600" }],
        "headline-md": ["32px", { lineHeight: "40px", fontWeight: "500" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "display-hero": ["84px", { lineHeight: "92px", letterSpacing: "-0.02em", fontWeight: "700" }],
        button: ["14px", { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.1em", fontWeight: "600" }]
      },
      boxShadow: {
        "whisper": "0px 0px 30px 0px rgba(8, 18, 41, 0.04)",
      },
      container: {
        center: true,
        padding: { DEFAULT: "1rem", lg: "2rem" },
        screens: { 
          "2xl": "1440px" 
        }
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
