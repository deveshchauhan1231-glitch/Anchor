import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CSS-variable-backed colors — shift automatically by theme
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          light: 'var(--color-surface-light)',
          lighter: 'var(--color-surface-lighter)',
          border: 'var(--color-surface-border)',
        },
        brand: {
          50:  'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          300: 'var(--color-brand-300)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
          800: 'var(--color-brand-800)',
          900: 'var(--color-brand-900)',
          950: 'var(--color-brand-950)',
        },
        accent: {
          violet: '#8b5cf6',
          purple: '#a855f7',
          indigo: '#6366f1',
          cyan: '#06b6d4',
          emerald: '#10b981',
          rose: '#f43f5e',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glow-subtle': 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.12) 0%, transparent 60%)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
