/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          base: "rgb(var(--cb-base) / <alpha-value>)",
          surface: "rgb(var(--cb-surface) / <alpha-value>)",
          "surface-hover": "rgb(var(--cb-surface-hover) / <alpha-value>)",
          border: "rgb(var(--cb-border) / <alpha-value>)",
          "border-light": "rgb(var(--cb-border-light) / <alpha-value>)",
          muted: "rgb(var(--cb-muted) / <alpha-value>)",
          text: "rgb(var(--cb-text) / <alpha-value>)",
          heading: "rgb(var(--cb-heading) / <alpha-value>)",
          cyan: "rgb(var(--cb-cyan) / <alpha-value>)",
          "cyan-dark": "rgb(var(--cb-cyan-dark) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--cb-accent) / <alpha-value>)",
          hover: "rgb(var(--cb-accent-hover) / <alpha-value>)",
          mute: "rgb(var(--cb-accent-mute) / <alpha-value>)",
        },
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        md: "0.375rem",
        lg: "0.5rem",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      boxShadow: {
        "cyber-glow": "0 0 0 1px rgba(6, 182, 212, 0.25), 0 4px 24px -8px rgba(6, 182, 212, 0.35)",
        "cyan-glow": "0 0 20px rgba(6, 182, 212, 0.25)",
        "red-glow": "0 0 20px rgba(239, 68, 68, 0.25)",
        "emerald-glow": "0 0 15px rgba(16, 185, 129, 0.2)",
      },
      animation: {
        "scan-line": "scanline 3s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fade-in 0.35s ease-out",
        "rise-up": "rise-up 0.4s ease-out",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "rise-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}
