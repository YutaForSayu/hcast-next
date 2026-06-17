import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0f",
          secondary: "#111118",
          tertiary: "#1a1a24",
          card: "#16161f",
          elevated: "#1e1e2a",
        },
        accent: {
          DEFAULT: "#e63946",
          hover: "#ff4757",
          muted: "#e6394620",
        },
        brand: {
          DEFAULT: "#e63946",
          secondary: "#ff6b35",
          glow: "#e6394640",
        },
        text: {
          primary: "#f0f0f5",
          secondary: "#9090a8",
          muted: "#60607a",
          dim: "#404058",
        },
        border: {
          DEFAULT: "#2a2a3a",
          light: "#3a3a4e",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-noise": "url('/noise.svg')",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "slide-down": "slideDown 0.3s ease forwards",
        "scale-in": "scaleIn 0.2s ease forwards",
        shimmer: "shimmer 2s infinite",
        "spin-slow": "spin 3s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(230, 57, 70, 0.3)",
        "glow-sm": "0 0 10px rgba(230, 57, 70, 0.2)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
