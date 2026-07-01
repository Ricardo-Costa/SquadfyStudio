import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
      },
      colors: {
        // Warm, ink-tinted neutral scale — replaces raw Tailwind gray.
        ink: {
          25: 'oklch(98.5% 0.004 80)',
          50: 'oklch(97% 0.006 80)',
          100: 'oklch(94% 0.008 80)',
          200: 'oklch(88% 0.01 80)',
          300: 'oklch(78% 0.012 80)',
          400: 'oklch(64% 0.014 75)',
          500: 'oklch(52% 0.014 75)',
          600: 'oklch(42% 0.014 75)',
          700: 'oklch(33% 0.014 75)',
          800: 'oklch(24% 0.013 75)',
          900: 'oklch(17% 0.012 75)',
          950: 'oklch(12% 0.01 75)',
        },
        // Rust/amber accent — the single "draft marker" color for primary actions.
        rust: {
          50: 'oklch(96% 0.02 50)',
          100: 'oklch(91% 0.045 48)',
          300: 'oklch(80% 0.09 46)',
          400: 'oklch(70% 0.13 45)',
          500: 'oklch(60% 0.16 42)',
          600: 'oklch(52% 0.16 38)',
          700: 'oklch(43% 0.15 35)',
        },
        // Muted seniority markers — desaturated relative to stock Tailwind swatches.
        seniority: {
          junior: 'oklch(55% 0.09 250)',
          mid: 'oklch(62% 0.11 75)',
          senior: 'oklch(55% 0.1 155)',
        },
        // Cool graphite scale for the dark surfaces (sidebar, squad panel) —
        // kept deliberately lighter/less saturated than near-black so it reads
        // as a considered dark surface, not a heavy black slab.
        graphite: {
          50: 'oklch(96% 0.006 264)',
          200: 'oklch(80% 0.012 264)',
          400: 'oklch(73% 0.013 264)',
          500: 'oklch(58% 0.015 264)',
          600: 'oklch(44% 0.016 264)',
          700: 'oklch(35% 0.018 264)',
          800: 'oklch(29% 0.018 264)',
        },
      },
    },
  },
  plugins: [],
}

export default config
