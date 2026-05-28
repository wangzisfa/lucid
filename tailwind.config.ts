import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        'bg-deep': 'var(--bg-deep)',
        'bg-cosmos': 'var(--bg-cosmos)',
        'text-hi': 'var(--text-hi)',
        'text-mid': 'var(--text-mid)',
        'text-lo': 'var(--text-lo)',
        'text-disabled': 'var(--text-disabled)',
        rose: 'var(--rose)',
        cyan: 'var(--cyan)',
        mint: 'var(--mint)',
        amber: 'var(--amber)',
        violet: 'var(--violet)',
      },
    },
  },
  plugins: [],
};

export default config;
