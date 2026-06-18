/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        nova: {
          bg: "#0d0f14",
          card: "#13161e",
          border: "#1e2130",
          surface: "#181b26",
          accent: "#7c5cfc",
          accent2: "#3b82f6",
          glow: "#7c5cfc33",
          text: "#e2e8f0",
          muted: "#64748b",
        },
      },
      backgroundImage: {
        "nova-gradient": "linear-gradient(135deg, #7c5cfc 0%, #3b82f6 100%)",
        "nova-gradient-dark": "linear-gradient(135deg, #4c35b5 0%, #1d4ed8 100%)",
        "card-gradient": "linear-gradient(145deg, #13161e 0%, #0d0f14 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px #7c5cfc33" },
          "50%": { boxShadow: "0 0 40px #7c5cfc66" },
        },
      },
    },
  },
  plugins: [],
}