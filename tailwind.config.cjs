/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      md: "48rem",
      lg: "64rem",
      xl: "80rem",
      wide: "100rem",
    },
    extend: {
      colors: {
        canvas: "hsl(var(--color-canvas) / <alpha-value>)",
        surface: "hsl(var(--color-surface) / <alpha-value>)",
        ink: "hsl(var(--color-text-primary) / <alpha-value>)",
        muted: "hsl(var(--color-text-secondary) / <alpha-value>)",
        rule: "hsl(var(--color-rule) / <alpha-value>)",
        brand: "hsl(var(--color-brand) / <alpha-value>)",
        highlight: "hsl(var(--color-highlight) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-primary)"],
        accent: ["var(--font-accent)"],
      },
      spacing: {
        page: "var(--space-page-x)",
        section: "var(--space-section-y)",
      },
      transitionDuration: {
        fast: "var(--primitive-duration-fast)",
        standard: "var(--primitive-duration-standard)",
        chapter: "var(--primitive-duration-chapter)",
      },
    },
  },
  plugins: [],
};
