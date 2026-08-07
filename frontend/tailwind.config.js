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
          base: "#070a0f",
          surface: "#0d121d",
          "surface-hover": "#141c2c",
          border: "#1e293b",
          "border-light": "#334155",
          muted: "#64748b",
          text: "#e2e8f0",
          heading: "#f8fafc",
          cyan: "#06b6d4",
          "cyan-dark": "#0891b2",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      boxShadow: {
        "cyan-glow": "0 0 20px rgba(6, 182, 212, 0.25)",
        "red-glow": "0 0 20px rgba(239, 68, 68, 0.25)",
        "emerald-glow": "0 0 15px rgba(16, 185, 129, 0.2)",
      },
      animation: {
        "scan-line": "scanline 3s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
    },
  },
  plugins: [],
}
