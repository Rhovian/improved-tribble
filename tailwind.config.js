/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // the scene's palette, as CSS variables
      colors: {
        paper: "var(--paper)",
        "paper-2": "var(--paper-2)",
        ink: "var(--ink)",
        "ink-strong": "var(--ink-strong)",
        muted: "var(--muted)",
        rule: "var(--rule)",
        rim: "var(--rim)",
        gold: "var(--gold)",
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "ui-monospace", "monospace"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
