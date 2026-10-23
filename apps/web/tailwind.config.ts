import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: { DEFAULT: '#7c3aed', bright: '#8b5cf6' },
        surface: { DEFAULT: '#131520', raised: '#1a1d2e' },
      },
    },
  },
  plugins: [],
}

export default config
